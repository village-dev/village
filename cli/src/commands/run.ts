import { warnUnauthenticated } from '@common/auth'
import { villageClient } from '@common/villageClient'
import { Command } from 'commander'

export const run = (program: Command) => {
    program
        .command('run')
        .description('Run the latest build for a script')
        .argument('<script_id>', 'The ID of the script to run')
        .option('-p, --params [key=value...]', 'Pass options to the script')
        .action(async function () {
            const debug: boolean = this.opts().debug

            const rawParams: string[] = this.opts().params
            let params: Record<string, string>

            try {
                if (rawParams === undefined) {
                    params = {}
                } else {
                    const splitParams = rawParams.map((x) => x.split('=', 2))
                    params = Object.fromEntries(splitParams)
                }
            } catch (err) {
                console.log('Invalid params format.')
                return
            }
            villageClient.scripts
                .runScript({ script_id: program.args[1], params })
                .then(({ build_id: buildId, output }) => {
                    console.log(
                        `Running script ${program.args[1]} with build ${buildId}`
                    )
                    console.log(output)
                })
                .catch(warnUnauthenticated)
                .catch((err) => {
                    console.error(err)
                })
        })
}
