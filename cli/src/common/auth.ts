import { TOKENS_FILE, WORKSPACES_FILE } from '@config'
import fs from 'fs'
import { Workspace } from '../../api'

export const getTokens = ({ debug }: { debug: boolean } = { debug: false }) => {
    return getFile({ filePath: TOKENS_FILE, debug })
}

export const getWorkspaces = (
    { debug }: { debug: boolean } = { debug: false }
): { defaultWorkspace: Workspace } => {
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
