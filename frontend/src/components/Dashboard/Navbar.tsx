import { Fragment } from 'react'
import { useUserContext } from '@contexts/UserContext'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'
// import { ReactComponent as LogoIcon } from '@components/logo.svg'
import { ReactComponent as LogoIcon } from '../../../public/logo.svg'

function WorkspaceListBox() {
    const { user, setCurrentWorkspace } = useUserContext()
    // const numWorkspaces = user?.workspaces?.length ?? 0

    return (
        <div className="relative w-48">
            <Listbox
                disabled={user?.workspaces === null}
                value={user?.currentWorkspace}
                onChange={setCurrentWorkspace}
            >
                <Listbox.Button className="relative w-full cursor-default truncate pl-4 pr-6 text-sm font-medium text-black">
                    <span className="block truncate">
                        {user?.currentWorkspace?.workspace?.name ||
                            'Loading...'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                            className="h-5 w-5 bg-cream text-black"
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
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {(user?.workspaces ?? []).map((workspace, idx) => (
                            <Listbox.Option
                                key={workspace.workspace_id}
                                value={workspace}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-3 px-4 ${
                                        active
                                            ? 'bg-emerald-100 text-emerald-900'
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

export const Navbar: React.FC = () => {
    return (
        <nav className="mb-16 flex h-12 w-screen items-center space-x-4 border-b bg-cream pl-4 text-sm">
            <span className="flex items-center space-x-2">
                <LogoIcon className="h-5 w-5" />
                <span className="font-display text-xl font-bold italic text-green">
                    village
                </span>
            </span>
            <WorkspaceListBox />
            <a href="http://docs.village.dev" className="text-gray-700">
                Documentation
            </a>
            {/* <NavLink
                    to="/app/new/workspace"
                    className="rounded-lg border p-2 text-xl text-zinc-400 shadow-md"
                >
                    <FiPlus />
                </NavLink> */}
        </nav>
    )
}
