import { format, formatDistance, parseISO } from 'date-fns'

export const getTimeSince = (dateIso: string) => {
    return formatDistance(parseISO(dateIso), new Date(), {
        addSuffix: true,
    })
}

export const getFormattedDate = (dateIso: string) => {
    return format(parseISO(dateIso), 'LLL dd, yyyy')
}
