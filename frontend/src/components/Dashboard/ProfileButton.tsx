import { LogoutButton } from '@components/LogoutButton'
import { Transition } from '@headlessui/react'
import { createRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import useOnClickOutside from '@hooks/useOnClickOutside'
import { NavLink } from 'react-router-dom'
import { RiSettings4Line } from 'react-icons/ri'
import { FiLogOut } from 'react-icons/fi'

export const ProfileButton: React.FC = () => {
    const { user } = useAuth0()

    const [showUserOptions, setShowUserOptions] = useState(false)
    const toggleUserOptions = () => {
        setShowUserOptions(!showUserOptions)
    }
    const userOptionsRef = createRef<HTMLDivElement>()
    useOnClickOutside(userOptionsRef, () => {
        setShowUserOptions(false)
    })

    const profileButtonStyle =
        'flex items-center w-full px-3 py-3 text-sm text-left text-gray-600 hover:text-black rounded-lg hover:bg-gray-100 transform hover:-translate-y-0.5 transition ease-in-out duration-200 mb-0.5'

    return (
        <div className="relative">
            <button
                className="0 flex w-full items-center rounded-lg px-1 py-1 hover:bg-gray-100"
                onClick={toggleUserOptions}
            >
                {user?.picture ? (
                    <img
                        src={user?.picture}
                        alt={user?.name}
                        className="h-8 w-8 rounded-full"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300" />
                )}
            </button>
            <Transition
                show={showUserOptions}
                enter="transform transition duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transform duration-200 transition ease-in-out"
                leaveFrom="opacity-100 scale-100 "
                leaveTo="opacity-0 scale-95"
                className="absolute right-0 z-10 w-auto"
            >
                <div
                    className="rounded-lg border bg-white px-1 pt-2 pb-1 shadow "
                    ref={userOptionsRef}
                >
                    <NavLink to="/app/settings" className={profileButtonStyle}>
                        <RiSettings4Line className="mr-3 text-xl text-black" />{' '}
                        Settings
                    </NavLink>

                    <div className="mb-1 w-auto border-b "></div>
                    <LogoutButton className={profileButtonStyle}>
                        <FiLogOut className="mr-3 text-xl text-black " />
                        Sign out
                    </LogoutButton>
                </div>
            </Transition>
        </div>
    )
}
