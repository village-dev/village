import { useAuth0 } from '@auth0/auth0-react'
import { LogoutButton } from '@components/LogoutButton'
import { Listbox, Transition } from '@headlessui/react'
import {
    BookOpenIcon,
    ChevronUpDownIcon,
    ClockIcon,
    InboxIcon,
    LifebuoyIcon,
    PuzzlePieceIcon,
} from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/solid'
import useOnClickOutside from '@hooks/useOnClickOutside'
import { useUserContext } from '@contexts/UserContext'
import React, { createRef, Fragment, useState } from 'react'
import { FiLogOut, FiPlus } from 'react-icons/fi'
import { RiSettings4Line } from 'react-icons/ri'
import { NavLink } from 'react-router-dom'
import { WorkspaceService } from '../../../api'

export const Sidebar: React.FC = () => {
    const buttonStyle =
        'text-gray-800 font-semibold py-2 px-2 rounded-md flex items-center'

    const inactiveButtonStyle = `${buttonStyle} hover:bg-zinc-100 text-zinc-600`
    const activeButtonStyle = `${buttonStyle} bg-zinc-100 text-black`
    const profileButtonStyle =
        'flex items-center w-full px-3 py-3 text-sm text-left text-gray-600 hover:text-black dark:text-gray-200 dark:hover:bg-zinc-700 rounded-lg hover:bg-gray-100 transform hover:-translate-y-0.5 transition ease-in-out duration-200 mb-0.5'

    return (
        <nav className="flex h-screen w-72 shrink-0 flex-col border-r-2 px-4 py-8">
            {/* Middle links */}
            <div className="mt-6 flex flex-col space-y-2">
                <NavLink
                    to="/app/new/script"
                    className="flex items-center rounded-md px-2 py-2 font-semibold text-emerald-500 hover:bg-emerald-50"
                >
                    <PlusIcon
                        className="mr-1.5 h-6 w-6 rounded-md bg-emerald-100 p-0.5 text-emerald-500"
                        aria-hidden="true"
                    />
                    New Script
                </NavLink>
                <NavLink
                    to="/app/scripts"
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <PuzzlePieceIcon className="mr-1.5 h-6 w-6 rounded p-0.5" />
                    Scripts
                </NavLink>
                <NavLink
                    to="/app/schedules"
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <ClockIcon className="mr-1.5 h-6 w-6 rounded p-0.5" />
                    Schedules
                </NavLink>
                {/* <NavLink to="/workflows">Workflows</NavLink> */}
                <NavLink
                    to="/app/runs"
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <InboxIcon className="mr-1.5 h-6 w-6 rounded p-0.5" />
                    Runs
                </NavLink>
            </div>
            {/* Bottom links */}
            <div className="flex h-full flex-col justify-end space-y-2">
                <NavLink
                    to="/docs"
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <BookOpenIcon className="mr-1.5 h-6 w-6 rounded p-0.5" />
                    Documentation
                </NavLink>
                <NavLink
                    to="/support"
                    className={({ isActive }) =>
                        isActive ? activeButtonStyle : inactiveButtonStyle
                    }
                >
                    <LifebuoyIcon className="mr-1.5 h-6 w-6 rounded p-0.5" />
                    Support
                </NavLink>
            </div>
        </nav>
    )
}
