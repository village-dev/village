import { API_BASE_URL } from '../config'

import { VillageClient } from '../../api'
import { getTokens } from './auth'

export const villageClient = new VillageClient({
    BASE: API_BASE_URL,
    WITH_CREDENTIALS: true,
    HEADERS: async () => {
        const tokens = await getTokens({ debug: false })

        return {
            Authorization: `Bearer ${tokens?.access_token}`,
        }
    },
})
