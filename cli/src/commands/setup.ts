import { warnUnauthenticated } from '@common/auth'
import { initializeScriptYaml } from '@common/configFile'
import { villageClient } from '@common/villageClient'
import { Command } from 'commander'
import fs from 'fs'
import inquirer from 'inquirer'

const downloadAndInit = ({ id, debug }: { id: string; debug: boolean }) => {
    villageClient.scripts
        .getScript(id)
        .then((s) => {
            initializeScriptYaml({
                id: s.id,
                name: s.name,
                engine: s.engine,
                engine_version: s.engine_version,
                params: Object.fromEntries(
                    s.builds?.[0].params?.map((p) => [
                        p.key,
                        {
                            description: p.description,
                            default: p.default,
                            required: p.required,
                            options: p.options,
                            type: p.type,
                        },
                    ]) ?? []
                ),
            })
        })
        .catch(warnUnauthenticated)
        .catch((err) => {
            if (err.status === 404) {
                console.log(`Script ${id} not found.`)
            }

            debug && console.error(err)
        })
}

export const setupScript = (program: Command) => {
    program
        .command('setup')
        .description('Set up a new script')
        .argument('<id>', 'ID of the script to set up.')
        .action(async function () {
            const debug: boolean = this.opts().debug

            const id: string = program.args[1]

            // if village.yaml exists, ask before overwriting
            if (fs.existsSync('./village.yaml')) {
                inquirer
                    .prompt([
                        {
                            type: 'confirm',
                            name: 'confirm',
                            message: 'village.yaml already exists. Overwrite?',
                            default: false,
                        },
                    ])
                    .then((answers: { confirm: boolean }) => {
                        if (answers.confirm) {
                            downloadAndInit({ id, debug })
                        }
                    })
            } else {
                downloadAndInit({ id, debug })
            }
        })
}
