import { Command } from 'commander'
import { TOKENS_FILE, WORKSPACES_FILE } from '@config'
import fs from 'fs'

export const logout = (program: Command) => {
    program
        .command('logout')
        .description('Log out of Village')
        .action(async function () {
            try {
                fs.unlinkSync(TOKENS_FILE)
                fs.unlinkSync(WORKSPACES_FILE)
                console.log('Logged out of Village')
            } catch (error) {
                console.error(error)
            }
        })
}
