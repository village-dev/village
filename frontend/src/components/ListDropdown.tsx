import { Transition } from '@headlessui/react'
import { useState, createRef, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { usePopper } from 'react-popper'

import useOnClickOutside from '../hooks/useOnClickOutside'

export function ListDropdown({
    options,
    icon,
}: {
    options: {
        id: string
        name: string
        icon: ReactNode
        handler: () => void
        // styles: ...
    }[]
    icon?: ReactNode
}) {
    const [showOptions, setShowOptions] = useState(false)
    const optionsRef = createRef<HTMLDivElement>()

    // Detect clicks inside and outside to show/hide options
    useOnClickOutside(optionsRef, () => {
        setShowOptions(false)
    })

    const [referenceElement, setReferenceElement] = useState(undefined)
    const [popperElement, setPopperElement] = useState(undefined)
    const [arrowElement, setArrowElement] = useState(null)
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
        placement: 'bottom-end',
    })

    return (
        <div className="text-left">
            <button
                className="rounded-lg p-2 hover:bg-zinc-100"
                type="button"
                onClick={() => {
                    setShowOptions(true)
                }}
                // @ts-ignore
                ref={setReferenceElement}
            >
                {!icon ? <BsThreeDotsVertical /> : icon}
            </button>

            {ReactDOM.createPortal(
                <div
                    // @ts-ignore
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                    className="z-10"
                >
                    <Transition
                        appear={true}
                        show={showOptions}
                        enter="transform transition duration-250"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transform duration-250 transition ease-in-out"
                        leaveFrom="opacity-100 scale-100 "
                        leaveTo="opacity-0 scale-95"
                    >
                        <div
                            className="w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none "
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="menu-button"
                            ref={optionsRef}
                        >
                            {options.map((o) => (
                                <div className="py-1" role="none" key={o.id}>
                                    <button
                                        type="button"
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 "
                                        role="menuitem"
                                        id="menu-item-1"
                                        onClick={o.handler}
                                    >
                                        <div className="flex">
                                            {o.icon}
                                            {o.name}
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div
                            // @ts-ignore
                            ref={setArrowElement}
                            style={styles.arrow}
                            className="scale-200 absolute -right-2 ml-2 h-4 w-4 rotate-45"
                        />
                    </Transition>
                </div>,
                document.body
            )}
        </div>
    )
}
