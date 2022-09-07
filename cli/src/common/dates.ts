import { formatDistance, parseISO } from 'date-fns'

export const getTimeSince = (dateIso: string) => {
    return formatDistance(parseISO(dateIso), new Date(), {
        addSuffix: true,
    })
}
