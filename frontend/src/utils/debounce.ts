// eslint-disable-next-line @typescript-eslint/ban-types
export const debounce = (func: Function, timeout: number) => {
    let timer: number | null = null
    return (...args: unknown[]) => {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, timeout)
    }
}
