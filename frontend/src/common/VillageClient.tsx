import { villageClient } from '../../api'
import { API_BASE_URL } from '@config'

export const VillageClient = new villageClient({
    BASE: API_BASE_URL,
})
