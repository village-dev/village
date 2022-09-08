import { getTokens } from '@common/auth'
import { Command } from 'commander'

export const token = (program: Command) => {
    program
        .command('token')
        .description('Get user access token')
        .action(async function () {
            const tokens = await getTokens()

            console.log(tokens.access_token)
        })
}
