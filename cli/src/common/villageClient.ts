import { API_BASE_URL } from '../config'

import { VillageClient } from '../../api'
import { getTokens } from './auth'
export const villageClient = new VillageClient({
    BASE: API_BASE_URL,
    WITH_CREDENTIALS: true,
    HEADERS: {
        Authorization: `Bearer ${getTokens({ debug: false })?.access_token}`,
    },
})
