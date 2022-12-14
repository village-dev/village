import { useEffect, RefObject } from 'react'

type Event = MouseEvent | TouchEvent

/**
 * Hook for detecting clicks outside an element.
 * @summary Hook for detecting clicks outside an element.
 * @param ref: reference to element to detect outside clicks for.
 * @param handler: function to execute on click outside.
 */
function useOnClickOutside<T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,

    handler: (event: Event) => void
): void {
    useEffect(() => {
        const listener = (event: Event) => {
            const el = ref?.current

            // Do nothing if clicking ref's element or descendent elements
            if (!el || el.contains((event?.target as Node) || null)) {
                return
            }

            handler(event)
        }

        document.addEventListener(`mousedown`, listener)
        document.addEventListener(`touchstart`, listener)

        return () => {
            document.removeEventListener(`mousedown`, listener)
            document.removeEventListener(`touchstart`, listener)
        }

        // Reload only if ref or handler changes
    }, [ref, handler])
}

export default useOnClickOutside
