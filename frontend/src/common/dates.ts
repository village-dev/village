import { format, formatDistance, parseISO } from 'date-fns'

export const getTimeSince = (dateIso: string) => {
    return formatDistance(parseISO(dateIso), new Date(), {
        addSuffix: true,
    })
}

export const getDuration = (startIso: string, endIso: string) => {
    const start = parseISO(startIso)
    const end = parseISO(endIso)
    return formatDistance(start, end, { addSuffix: false })
}

export const getFormattedDateTime = (datetimeIso: string) => {
    return format(parseISO(datetimeIso), 'LLL dd, yyyy HH:mm a')
}

export const getFormattedDate = (dateIso: string) => {
    return format(parseISO(dateIso), 'LLL dd, yyyy')
}
