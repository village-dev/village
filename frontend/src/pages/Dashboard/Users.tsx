import { VillageClient } from '@common/VillageClient'
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '@config'
import { UserContext } from '@contexts/UserContext'
import { useContext, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { HiOutlineClipboardCopy } from 'react-icons/hi'
import { Role, WorkspaceUsers } from '../../../api'
import { Table } from '@components/Table'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid'
import { Fragment } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export interface Option {
    label: string
    value: string
}

export const Select: React.FC<{
    options: Option[]
    selected: Option
    setSelected: (option: Option) => void
}> = ({ options, selected, setSelected }) => {
    return (
        <Listbox value={selected} onChange={setSelected}>
            <div className="relative border border-l-0 border-gray-300">
                <Listbox.Button className="relative h-full w-full cursor-default bg-white py-2 pl-3 pr-10 text-left sm:text-sm">
                    <span className="block truncate">{selected.label}</span>
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
                    <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {options.map((option, idx) => (
                            <Listbox.Option
                                key={idx}
                                className={({ active }) =>
                                    `relative flex cursor-default select-none py-2 px-3 ${
                                        active
                                            ? 'bg-amber-100 text-amber-900'
                                            : 'text-gray-900'
                                    }`
                                }
                                value={option}
                            >
                                {({ selected }) => (
                                    <>
                                        <span
                                            className={`block ${
                                                selected
                                                    ? 'font-medium'
                                                    : 'font-normal'
                                            }`}
                                        >
                                            {option.label}
                                        </span>
                                        {selected ? (
                                            <span className="inset-y-0 flex items-center pr-2 pl-3 text-amber-600">
                                                <CheckIcon
                                                    className="h-5 w-5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    )
}

enum UserRoles {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

const roles = [
    { value: UserRoles.ADMIN, label: 'Admin' },
    { value: UserRoles.USER, label: 'User' },
]

const redirectUri = 'http://localhost:5173/app'
const createShareLink = (uriSafeState: string) =>
    `https://${AUTH0_DOMAIN}/authorize?response_type=code&client_id=${AUTH0_CLIENT_ID}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&state=${uriSafeState}&screen_hint=signup&testing=yeet`

const NoUsers: React.FC = () => {
    return (
        <div className="mx-6 flex h-full flex-col items-center justify-center rounded-xl bg-gray-100">
            <h1 className="text-2xl font-semibold">No users</h1>
            <p className="mt-8 text-gray-600">Add some users</p>
        </div>
    )
}

const NoResults: React.FC = () => {
    return (
        <tr>
            <td colSpan={3} align="center" className="py-16 ">
                <h1 className="text-lg font-semibold text-gray-400">
                    No users found
                </h1>
            </td>
        </tr>
    )
}

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
    if (role === Role.ADMIN) {
        return (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-500">
                Admin
            </span>
        )
    }

    return (
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-500">
            User
        </span>
    )
}

const UserRow: React.FC<{ data: WorkspaceUsers; idx: number }> = ({
    data,
    idx,
}) => {
    const workspaceUser = data
    return (
        <tr
            className={'hover:bg-lightgreen' + (idx % 2 ? ' bg-gray-50' : '')}
            key={workspaceUser.user_id}
        >
            <td className="group">
                <div className="h-full w-full py-4 pl-4 pr-8">
                    <RoleBadge role={workspaceUser.role} />
                </div>
            </td>
            <td className="pl-4">{workspaceUser.user_id}</td>
        </tr>
    )
}

const saveUserEmail = async (
    email: string,
    workspace_id: string,
    role: UserRoles
) => {
    return await VillageClient.invites.createInvite(
        email,
        workspace_id,
        role as unknown as Role
    )
}

const searchFilter = ({
    query,
    data,
}: {
    query: string
    data: WorkspaceUsers
}) => {
    const workspaceUser = data
    return (
        workspaceUser.user_id.toLowerCase().includes(query.toLowerCase()) ||
        workspaceUser.role.toLowerCase().includes(query.toLowerCase())
    )
}

export const Users: React.FC = () => {
    const [users, setUsers] = useState<WorkspaceUsers[]>([])
    const [selectedRole, setSelectedRole] = useState<Option>(roles[1])
    const [email, setEmail] = useState('')
    const userContext = useContext(UserContext)
    const currentWorkspace = userContext?.user?.currentWorkspace

    useEffect(() => {
        if (!currentWorkspace) return
        VillageClient.workspace
            .listWorkspaceUsers(currentWorkspace.workspace_id)
            .then((s) => {
                setUsers(s)
            })
    }, [currentWorkspace])

    return (
        <div className="flex h-full flex-col space-y-6 px-8 py-4">
            <div className="flex space-x-6 px-6">
                <h1 className="text-2xl">Users</h1>

                <div className="mx-2 flex">
                    <input
                        type="text"
                        className="z-10 block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Invite by email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Select
                        options={roles}
                        selected={selectedRole}
                        setSelected={setSelectedRole}
                    />

                    <button
                        className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 disabled:cursor-not-allowed disabled:bg-opacity-50 disabled:text-blue-400"
                        disabled={!currentWorkspace?.workspace_id}
                        onClick={async () => {
                            console.log('currentWorkspace?.workspace_id')
                            const inviteId = await saveUserEmail(
                                email,
                                currentWorkspace?.workspace_id!,
                                selectedRole.value as UserRoles
                            )
                            navigator.clipboard.writeText(
                                createShareLink(inviteId)
                            )
                            toast.success('Copied to clipboard')
                        }}
                    >
                        <HiOutlineClipboardCopy className="h-6 w-6" />
                    </button>
                </div>
            </div>
            <div className="h-full flex-grow px-6">
                <Table
                    loading={false}
                    emptyState={<NoUsers />}
                    noResultsState={<NoResults />}
                    columnNames={['Role', 'ID']}
                    columnWidths={['w-1/6', 'w-5/4']}
                    rowData={users}
                    RowRenderer={UserRow}
                    searchFilter={searchFilter}
                />
            </div>
        </div>
    )
}
