import { Command } from 'commander'

import { getTokens, warnUnauthenticated } from '@common/auth'
import { Config } from '@common/types'
import { API_BASE_URL } from '@config'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import picomatch from 'picomatch'
import tar from 'tar'
import tmp from 'tmp'

const defaultIgnore = [
    '.git',
    '.gitmodules',
    '.vscode',
    '.next',
    '.npm',
    '.venv',
    '.yarn',
    '__pycache__',
    'bin',
    'dist',
    'node_modules',
    'yarn-error.log',
    '.DS_Store',
]

export const deploy = (program: Command) => {
    program
        .command('deploy')
        .description('Deploy a script')
        .action(async function () {
            const debug: boolean = this.opts().debug

            const tokens = await getTokens({ debug })
            const { access_token } = tokens

            // get current directory
            const cwd = process.cwd()
            debug && console.log(`Current directory: ${cwd}`)
            let folderToCheck = cwd

            let hasConfig = false

            // check each parent folder for a village.yaml file
            while (folderToCheck !== '') {
                debug &&
                    console.log(`Checking ${folderToCheck} for village.yaml`)
                const configPath = `${folderToCheck}/village.yaml`
                if (fs.existsSync(configPath)) {
                    debug &&
                        console.log(`Found village.yaml in ${folderToCheck}`)
                    hasConfig = true
                    break
                }
                const nextParent = folderToCheck
                    .split(path.sep)
                    .slice(0, -1) // remove last folder
                    .join(path.sep)
                if (nextParent === folderToCheck) {
                    break
                }
                folderToCheck = nextParent
            }

            if (!hasConfig) {
                console.error(
                    'No village.yaml file found. Run "village init" to create one'
                )
                return
            }

            const baseFolder = folderToCheck

            let ignoreContents: string[]

            try {
                ignoreContents = fs
                    .readFileSync(
                        `${baseFolder}{path.sep}.villageignore`,
                        'utf8'
                    )
                    .split('\n')
            } catch (err) {
                debug && console.log('No .villageignore file found')
                ignoreContents = []
            }

            // picomatch breaks on empty strings
            ignoreContents = ignoreContents.filter((line) => line.length > 0)

            // split ignored files into array
            const ignoredFiles = [...defaultIgnore, ...ignoreContents]

            const nonnegated = ignoredFiles.filter(
                (file) => !file.startsWith('!')
            )
            const negated = ignoredFiles
                .filter((file) => file.startsWith('!'))
                .map((file) => file.slice(1)) // remove the !

            const nonnegatedMatcher = picomatch(nonnegated)
            const negatedMatcher = picomatch(negated)

            const configFilePath = `${baseFolder}${path.sep}village.yaml`

            const configContents = fs.readFileSync(configFilePath, 'utf8')

            const config: Config = yaml.load(configContents) as Config

            const tmpFile = tmp.fileSync()
            debug &&
                console.log(
                    `Created temporary file ${tmpFile.name} for tarball`
                )

            await tar.c(
                {
                    gzip: true,
                    file: tmpFile.name,
                    filter: (name: string) => {
                        const keep =
                            !nonnegatedMatcher(name) || negatedMatcher(name)
                        debug &&
                            console.log(`${name} ${keep ? 'keep' : 'ignore'}`)
                        return keep
                    },
                },
                ['./']
            )

            const form = new FormData()
            form.append('script_id', config.id)
            form.append('context', fs.createReadStream(tmpFile.name))

            // use a raw axios request because openapi-generator doesn't like streams
            axios
                .post(`${API_BASE_URL}/script/build`, form, {
                    headers: {
                        ...form.getHeaders(),
                        Authorization: `Bearer ${access_token}`,
                    },
                })
                .then((res) => {
                    console.log('Script deployed successfully')
                    console.log(tmpFile.name)

                    // delete the temporary file
                    tmpFile.removeCallback()
                })
                .catch(warnUnauthenticated)
                .catch((err) => {
                    if (err.response.status === 404) {
                        const relativeConfigPath = path.relative(
                            cwd,
                            configFilePath
                        )
                        console.log(
                            `Script with id '${config.id}' does not exist!`
                        )
                        console.log(
                            `Create it by running 'village init --from ${relativeConfigPath}' first!`
                        )
                    }

                    if (err.response.status === 403) {
                        console.log(
                            `You do not have permission to deploy script with id '${config.id}'`
                        )
                    }

                    debug && console.log(err)

                    // delete the temporary file
                    tmpFile.removeCallback()
                })
        })
}
