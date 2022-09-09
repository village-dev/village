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

/**
 * This assumes that a user always has at least one workspace.
 * Our backend should make sure that this is the case.
 */
function WorkspaceListBox() {
    const { user, setCurrentWorkspace } = useUserContext()

    return (
        <div className="relative w-full">
            <Listbox
                disabled={user?.workspaces === null}
                value={user?.currentWorkspace}
                onChange={setCurrentWorkspace}
            >
                <Listbox.Button className="relative w-full cursor-default truncate rounded-lg border bg-white py-2 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                    <span className="block truncate">
                        {user?.currentWorkspace?.workspace?.name ||
                            'Loading...'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </span>
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {(user?.workspaces ?? []).map((workspace) => (
                            <Listbox.Option
                                key={workspace.workspace_id}
                                value={workspace}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active
                                            ? 'bg-amber-100 text-amber-900'
                                            : 'text-gray-900'
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span
                                            className={`block truncate ${
                                                selected
                                                    ? 'font-medium'
                                                    : 'font-normal'
                                            }`}
                                        >
                                            {workspace.workspace?.name}
                                        </span>
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </Listbox>
        </div>
    )
}

export const Sidebar: React.FC = () => {
    const { user } = useAuth0()

    const [showUserOptions, setShowUserOptions] = useState(false)
    const toggleUserOptions = () => {
        setShowUserOptions(!showUserOptions)
    }
    const userOptionsRef = createRef<HTMLDivElement>()
    useOnClickOutside(userOptionsRef, () => {
        setShowUserOptions(false)
    })

    const buttonStyle =
        'text-gray-800 font-semibold py-2 px-2 rounded-md flex items-center'

    const inactiveButtonStyle = `${buttonStyle} hover:bg-zinc-100 text-zinc-600`
    const activeButtonStyle = `${buttonStyle} bg-zinc-100 text-black`
    const profileButtonStyle =
        'flex items-center w-full px-3 py-3 text-sm text-left text-gray-600 hover:text-black dark:text-gray-200 dark:hover:bg-zinc-700 rounded-lg hover:bg-gray-100 transform hover:-translate-y-0.5 transition ease-in-out duration-200 mb-0.5'

    return (
        <nav className="flex h-screen w-72 shrink-0 flex-col border-r-2 px-4 py-8">
            {/* Top profile stuff */}
            <div className="relative">
                <button
                    className="flex w-full items-center rounded-lg px-3 py-3 hover:bg-gray-100 dark:hover:bg-zinc-700"
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
                    <div className="ml-3 truncate font-semibold">
                        {user?.name ?? 'Loading...'}
                    </div>
                </button>
                <Transition
                    show={showUserOptions}
                    enter="transform transition duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transform duration-200 transition ease-in-out"
                    leaveFrom="opacity-100 scale-100 "
                    leaveTo="opacity-0 scale-95"
                    className="absolute z-10 w-full"
                >
                    <div
                        className="rounded-lg border bg-white px-1 pt-2 pb-1 shadow dark:border-zinc-500 dark:bg-zinc-800"
                        ref={userOptionsRef}
                    >
                        <NavLink
                            to="/app/settings"
                            className={profileButtonStyle}
                        >
                            <RiSettings4Line className="mr-3 text-xl text-black dark:text-white" />{' '}
                            Settings
                        </NavLink>

                        <div className="mb-1 w-auto border-b dark:border-b-zinc-600"></div>
                        <LogoutButton className={profileButtonStyle}>
                            <FiLogOut className="mr-3 text-xl text-black dark:text-white" />
                            Sign out
                        </LogoutButton>
                    </div>
                </Transition>
            </div>
            {/* Workspace selector */}
            <div className="mt-4 flex items-center justify-between">
                <div className="mx-2 w-full min-w-0 flex-initial items-center">
                    <WorkspaceListBox />
                </div>
                <NavLink
                    to="/app/new-workspace"
                    className="rounded-lg border p-2 text-xl text-zinc-400 shadow-md"
                >
                    <FiPlus />
                </NavLink>
            </div>
            {/* Middle links */}
            <div className="mt-6 flex flex-col space-y-2">
                <NavLink
                    to="/app/new-script"
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
