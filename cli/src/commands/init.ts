import inquirer from 'inquirer'
import { Engine } from '../../api'

import { getWorkspaces, warnUnauthenticated } from '@common/auth'
import { initializeScriptYaml } from '@common/configFile'
import { Config } from '@common/types'
import { villageClient } from '@common/villageClient'
import { Command } from 'commander'
import fs from 'fs'
import yaml from 'js-yaml'

// ensure this is in sync with frontend/src/pages/NewScript.tsx
const engineVersions: { [key in Engine]: string[] } = {
    [Engine.NODE]: ['16', '17', '18'],
    [Engine.PYTHON]: ['3.8', '3.9', '3.10'],
}

const init = (debug: boolean): void => {
    const questions = [
        {
            type: 'input',
            name: 'name',
            message: 'Script name:',
        },
        {
            type: 'input',
            name: 'id',
            message: `Script id (leave blank to autogenerate):`,
        },
        // TODO: load workspace IDs / names from server
        {
            type: 'input',
            name: 'workspace_id',
            message: `Workspace ID:`,
        },
        {
            type: 'input',
            name: 'description',
            message: `Script description:`,
        },
        {
            type: 'list',
            name: 'engine',
            message: 'Script engine:',
            choices: Object.values(Engine),
        },
    ]

    inquirer
        .prompt(questions)
        .then(
            ({
                name,
                id,
                description,
                engine,
                workspace_id,
            }: {
                name: string
                id: string
                description: string
                engine: Engine
                workspace_id: string
            }) => {
                inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'engineVersion',
                            message: 'Engine version:',
                            choices: engineVersions[engine],
                        },
                    ])
                    .then(({ engineVersion }) => {
                        villageClient.scripts
                            .createScript({
                                id,
                                name,
                                description,
                                engine,
                                engine_version: engineVersion,
                                workspace_id,
                            })
                            .then((script) => {
                                initializeScriptYaml({
                                    ...script,
                                    params: {},
                                })
                            })
                            .catch(warnUnauthenticated)
                            .catch((err) => {
                                debug && console.error(err)
                            })
                    })
                    .catch((err) => {
                        debug && console.error(err)
                    })
            }
        )
        .catch((err) => {
            if (err.status === 400) {
                console.error(err.body.detail)
                console.log('Run with --debug to see full error')
            }
            debug && console.error(err)
        })
}

const initializeScriptFrom = ({
    from,
    debug,
}: {
    from: string
    debug: boolean
}) => {
    // check that file exists
    if (!fs.existsSync(from)) {
        console.error(`Config file ${from} does not exist`)
        return
    }

    // read config file
    const configContents = fs.readFileSync(from, 'utf8')

    const config: Config = yaml.load(configContents) as Config

    const { defaultWorkspace } = getWorkspaces({ debug })

    if (!defaultWorkspace) {
        console.error('No default workspace found')
        return
    }

    villageClient.scripts
        .createScript({
            id: config.id,
            name: config.name,
            engine: config.engine,
            engine_version: config.engine_version,
            workspace_id: defaultWorkspace.id,
        })
        .catch(warnUnauthenticated)
        .catch((err) => {
            if (err.status === 400) {
                console.error(err.body.detail)
                console.log('Run with --debug to see full error')
            }
            debug && console.error(err)
        })
}

const initializeExistingScript = ({ debug }: { debug: boolean }) => {
    // if village.yaml already exists, don't overwrite it
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
                    init(debug)
                }
            })
    } else {
        init(debug)
    }
}

export const createScript = (program: Command) => {
    program
        .command('init')
        .description('Init a new script')
        .option(
            '--from <path>',
            'Create a script from an existing config file (village.yaml).'
        )
        .action(async function () {
            const debug: boolean = this.opts().debug

            const from: string | undefined = this.opts().from

            // if initializing from a config file, read it and initialize script
            if (from) {
                initializeScriptFrom({ from, debug })
            } else {
                initializeExistingScript({ debug })
            }
        })
}
