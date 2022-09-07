import { getTokens } from '@common/auth'
import { villageClient } from '@common/villageClient'
import {
    AUTH0_AUDIENCE,
    AUTH0_CLIENT_ID,
    AUTH0_DOMAIN,
    TOKENS_FILE,
    WORKSPACES_FILE,
} from '@config'
import axios from 'axios'
import chalk from 'chalk'
import { Command } from 'commander'
import fs from 'fs'
import qs from 'qs'

import { dirname } from 'path'
import { getAuth0UserInfo } from './userinfo'
import { Workspace, WorkspaceUsers } from '../../api'

// see https://stackoverflow.com/questions/16316330/how-to-write-file-if-parent-folder-doesnt-exist
const writeFile = async (path: string, contents: string, callback) => {
    await fs.mkdir(dirname(path), { recursive: true }, function (err) {
        if (err) return callback(err)

        fs.writeFile(path, contents, callback)
    })
}

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
                .request(getRequestAccessTokenOptions(deviceCode))
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
    let workspaces: WorkspaceUsers[] = []
    let defaultWorkspace: Workspace | undefined = undefined
    try {
        villageClient.request.config.HEADERS = {
            Authorization: `Bearer ${accessToken}`,
        }
        const res = await villageClient.user.getCurrentUser()
        // TODO: make sure this isn't null
        workspaces = res.workspaces ?? []
        defaultWorkspace = res.default_workspace
    } catch (error) {
        if (error.message === 'Not Found') {
            const res = await villageClient.user.createUser(user.sub)
            workspaces = res.workspaces ?? []
        }
    }
    await writeFile(
        WORKSPACES_FILE,
        JSON.stringify({ workspaces, defaultWorkspace }),
        () => {
            return
        }
    )
}

export const login = (program: Command) => {
    program
        .command('login')
        .description('Login to Village')
        .action(async function () {
            const debug = this.opts().debug

            const tokens = await getTokens({ debug })

            if (tokens !== null) {
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

                await writeFile(TOKENS_FILE, JSON.stringify(data), () => {
                    console.log(
                        chalk.bold.greenBright('Successfully logged in!')
                    )
                })

                const { data: userInfo, errors } = await getAuth0UserInfo(data)
                debug && console.error(errors)
                await initializeUser(userInfo, data.access_token)
            } catch (error) {
                debug && console.error(error)
            }
        })
}
