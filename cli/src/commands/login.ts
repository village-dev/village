import { setWorkspaces, writeFile } from '@common/auth'
import { villageClient } from '@common/villageClient'
import {
    AUTH0_AUDIENCE,
    AUTH0_CLIENT_ID,
    AUTH0_DOMAIN,
    TOKENS_FILE,
} from '@config'
import axios, { AxiosRequestConfig } from 'axios'
import chalk from 'chalk'
import { Command } from 'commander'
import { existsSync } from 'fs'
import qs from 'qs'

import { getAuth0UserInfo } from './userinfo'

const getRequestAccessTokenOptions = (deviceCode: string) => {
    return {
        method: 'POST',
        url: `${AUTH0_DOMAIN}/oauth/token`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            device_code: deviceCode,
            client_id: AUTH0_CLIENT_ID,
            audience: AUTH0_AUDIENCE,
        }),
    }
}

const pollForAccessToken = (
    deviceCode: string
): Promise<{ access_token: string }> => {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            axios
                .request(
                    getRequestAccessTokenOptions(
                        deviceCode
                    ) as AxiosRequestConfig
                )
                .then((response) => {
                    if (response.data.access_token) {
                        clearInterval(interval)
                        resolve(response.data)
                    }
                })
                .catch((err) => {
                    if (err.response.data.error === 'authorization_pending') {
                        // TODO: do something here
                    } else if (err.response.data.error === 'slow_down') {
                        // TODO: do something here
                    } else if (err.response.data.error === 'expired_token') {
                        console.error(
                            'Authorization expired. Please try again.'
                        )
                        clearInterval(interval)
                        reject(err)
                    } else if (err.response.data.error === 'access_denied') {
                        console.error('Authorization denied. Please try again.')
                        clearInterval(interval)
                        reject(err)
                    }
                })
        }, 5000)
    })
}

const initializeUser = async (user: { sub: string }, accessToken: string) => {
    if (!user.sub) return
    let defaultWorkspace: string | undefined = undefined
    try {
        villageClient.request.config.HEADERS = {
            Authorization: `Bearer ${accessToken}`,
        }
        const res = await villageClient.users.getOrCreateUser()
        defaultWorkspace = (res.workspaces ?? [])[0].workspace_id
    } catch (error) {
        console.error(error)
    }

    if (defaultWorkspace === undefined) {
        throw new Error('Unable to initialize user. No default workspace.')
    } else {
        setWorkspaces({ workspaces: { defaultWorkspace }, debug: false })
    }
}

export const login = (program: Command) => {
    program
        .command('login')
        .description('Login to Village')
        .action(async function () {
            const debug = this.opts().debug

            // check if tokens file exists on disk

            if (existsSync(TOKENS_FILE)) {
                console.log(
                    "You're logged in! Run `village logout` to log out first."
                )
                return
            }

            try {
                const res = await axios.request({
                    method: 'POST',
                    url: `${AUTH0_DOMAIN}/oauth/device/code`,
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                    },
                    data: qs.stringify({
                        client_id: AUTH0_CLIENT_ID,
                        scope: 'openid email profile offline_access',
                        audience: AUTH0_AUDIENCE,
                    }),
                })
                const { verification_uri } = res.data
                console.log('Verify your login here:')
                console.log(chalk.bold.underline(verification_uri), '\n')
                console.log(
                    `Paste in this auth code: ${chalk.bold.blueBright(
                        res.data.user_code
                    )}`,
                    '\n'
                )

                const data = await pollForAccessToken(res.data.device_code)

                debug && console.log(data)

                await writeFile(
                    TOKENS_FILE,
                    JSON.stringify(data, null, 2),
                    () => {
                        console.log(
                            chalk.bold.greenBright('Successfully logged in!')
                        )
                    }
                )

                const { data: userInfo, errors } = await getAuth0UserInfo(data)
                debug && console.error(errors)
                await initializeUser(userInfo, data.access_token)
            } catch (error) {
                debug && console.error(error)
            }
        })
}
