import { Engine } from '../../api'
import { Config } from './types'
import yaml from 'js-yaml'
import fs from 'fs'

export const initializeScriptYaml = (config: Config): void => {
    console.log(`Created script ${config.name} (${config.id})`)

    // write config to yaml
    fs.writeFileSync('./village.yaml', yaml.dump(config))
    console.log('Run "village deploy" to deploy your script to Village.')
}
