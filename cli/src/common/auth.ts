import {
    AUTH0_CLIENT_ID,
    AUTH0_DOMAIN,
    TOKENS_FILE,
    WORKSPACES_FILE,
} from '@config'
import axios from 'axios'
import fs from 'fs'
import { dirname } from 'path'
import inquirer from 'inquirer'
import { Workspace } from '../../api'
import { villageClient } from './villageClient'

interface RefreshResponse {
    access_token: string
}

interface TokenType {
    access_token: string
    refresh_token: string
    id_token: string
    scope: string
    expires_in: number
    token_type: string
}

// see https://stackoverflow.com/questions/16316330/how-to-write-file-if-parent-folder-doesnt-exist
export const writeFile = async (path: string, contents: string, callback) => {
    await fs.mkdir(dirname(path), { recursive: true }, function (err) {
        if (err) return callback(err)

        fs.writeFile(path, contents, callback)
    })
}

export const getTokens = async (
    { debug }: { debug: boolean } = { debug: false }
) => {
    const tokens: TokenType = getFile({ filePath: TOKENS_FILE, debug })

    const access_token = tokens.access_token

    // get exp of access_token
    const exp = access_token.split('.')[1]
    const expDecoded = Buffer.from(exp, 'base64').toString('ascii')
    const expParsed = JSON.parse(expDecoded)
    const expDate = new Date(expParsed.exp * 1000)

    // if access_token is expired, refresh it
    if (expDate < new Date()) {
        const refresh_token = tokens.refresh_token

        try {
            const { data } = await axios.post<RefreshResponse>(
                `${AUTH0_DOMAIN}/oauth/token`,
                {
                    grant_type: 'refresh_token',
                    client_id: AUTH0_CLIENT_ID,
                    refresh_token,
                }
            )

            tokens.access_token = data.access_token

            fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2))
        } catch (err) {
            console.log('Error refreshing token. Please log in again.')

            debug && console.error(err)
        }
    }

    return tokens
}

export const setWorkspaces = async ({
    workspaces,
    debug,
}: {
    workspaces: { defaultWorkspace: string }
    debug: boolean
}) => {
    await writeFile(
        WORKSPACES_FILE,
        JSON.stringify(workspaces, null, 2),
        (err) => {
            debug && console.log('Error writing workspaces file', err)
        }
    )
}

export const getWorkspaces = ({
    debug,
}: {
    debug: boolean
}): { defaultWorkspace: Workspace } => {
    return getFile({ filePath: WORKSPACES_FILE, debug })
}

export const getFile = (
    { filePath, debug }: { filePath: string; debug: boolean } = {
        filePath: '',
        debug: false,
    }
) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        // Error handling?
        return JSON.parse(data.toString())
    } catch (err) {
        debug && console.log(err)
        return null
    }
}

export const getCurrentWorkspaceId = async (): Promise<string> => {
    const workspaces = await getFile({
        filePath: WORKSPACES_FILE,
        debug: false,
    })

    if (workspaces) {
        return JSON.parse(workspaces).defaultWorkspace
    }

    const { workspace, error } = await promptForCurrentWorkspace()
    if (workspace) {
        return workspace
    }
    throw new Error(error)
}

export const promptForCurrentWorkspace: () => Promise<{
    error?: any
    workspace?: string
}> = async function () {
    const tokens = await getTokens()
    const { access_token } = tokens

    try {
        villageClient.request.config.HEADERS = {
            Authorization: `Bearer ${access_token}`,
        }
        let workspaces: Workspace[] = []
        try {
            workspaces = await villageClient.workspace.listUserWorkspaces()
        } catch (error) {
            await warnUnauthenticated(error)
        }
        try {
            const { workspace } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'workspace',
                    message: 'Choose a default workspace',
                    choices: workspaces.map((workspace) => ({
                        name: workspace.name,
                        value: workspace.id,
                    })),
                },
            ])
            return { workspace }
        } catch (error) {
            return { error }
        }
    } catch (error) {
        return { error }
    }
}

export const warnUnauthenticated = async (err: any) => {
    if (err.status === 401) {
        console.error(
            'Authentication failed. Please refresh by running `village logout` and then `village login`.'
        )
    }

    if (err.status === 403) {
        console.error(
            'You do not have permission to perform this action. Please contact your workspace administrator.'
        )
    }

    throw err
}
