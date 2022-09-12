import { useAuth0 } from '@auth0/auth0-react'
import { VillageClient } from '@common/VillageClient'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { WorkspaceUsers } from '../../api'
import { useSearchParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

export type WorkspaceType = WorkspaceUsers

type UserType = {
    id: string
    workspaces: WorkspaceType[]
    currentWorkspace?: WorkspaceType
}

export type UserContextProps = {
    user: UserType | null
    refreshUser(): void
    setCurrentWorkspace(workspace: WorkspaceType): void
    setWorkspaces(workspacess: WorkspaceType[]): void
}

export const UserContext = React.createContext<UserContextProps | null>(null)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { getAccessTokenSilently } = useAuth0()
    const [searchParams, setSearchParams] = useSearchParams()
    const inviteId = searchParams.get('state')

    const [user, setUser] = useState<UserType | null>(null)

    const refreshUser = useCallback(async () => {
        const token = await getAccessTokenSilently({
            scope: 'openid profile email',
        })

        try {
            VillageClient.request.config.HEADERS = {
                Authorization: `Bearer ${token}`,
            }
            let user = await VillageClient.user.getOrCreateUser()

            if (inviteId) {
                try {
                    const workspace_name =
                        await VillageClient.invites.getInvite(inviteId)

                    toast.success(
                        `You were added to workspace ${workspace_name}`
                    )
                    user = await VillageClient.user.getOrCreateUser()
                } catch (error) {
                    console.error(error)
                }
                searchParams.delete('state')
                setSearchParams(searchParams)
            }

            setUser({
                id: user.id,
                workspaces: user.workspaces ?? [],
                currentWorkspace: user.workspaces?.[0],
            })
        } catch (error: any) {
            console.error(error)
        }
    }, [getAccessTokenSilently, inviteId])

    const setWorkspaces = useCallback(
        (workspaces: WorkspaceType[]) => {
            setUser((prev) => {
                if (!prev) return null
                return {
                    ...prev,
                    workspaces: workspaces,
                }
            })
        },
        [setUser]
    )

    const setCurrentWorkspace = useCallback(
        (workspace: WorkspaceType) => {
            setUser((prev) => {
                if (!prev) return null
                return {
                    ...prev,
                    currentWorkspace: workspace,
                }
            })
        },
        [setUser]
    )

    const store = useMemo(
        () => ({
            // Context state.
            user,
            refreshUser,
            setCurrentWorkspace,
            setWorkspaces,
        }),

        [user, refreshUser, setCurrentWorkspace, setWorkspaces]
    )

    return (
        <UserContext.Provider value={store}>
            {children}
            <Toaster />
        </UserContext.Provider>
    )
}

export const useUserContext = (): UserContextProps => useContext(UserContext)!
