import { Command } from 'commander'
import axios from 'axios'
import { getTokens } from '@common/auth'
import { AUTH0_DOMAIN } from '@config'

export const getAuth0UserInfo = async (providedTokens?: any) => {
    const tokens = providedTokens ? providedTokens : await getTokens()

    if (!tokens) {
        return {
            errors: "You're not authenticated",
        }
    }

    const { access_token } = tokens

    try {
        const { data } = await axios.get(`${AUTH0_DOMAIN}/userinfo`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })
        return {
            data,
        }
    } catch (err) {
        return {
            errors: 'User not found',
        }
    }
}

export const userinfo = (program: Command) => {
    program
        .command('userinfo')
        .description('Get user info')
        .action(async function () {
            const debug: boolean = this.opts().debug

            const { data, errors } = await getAuth0UserInfo()
            debug && console.log(errors)
            console.log(data)
        })
}
