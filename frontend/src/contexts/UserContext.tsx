import { useAuth0 } from '@auth0/auth0-react'
import { VillageClient } from '@common/VillageClient'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { WorkspaceUsers } from '../../api'

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
    const { user: auth0User, getAccessTokenSilently } = useAuth0()

    const [user, setUser] = useState<UserType | null>(null)

    const refreshUser = useCallback(async () => {
        const token = await getAccessTokenSilently()

        try {
            VillageClient.request.config.HEADERS = {
                Authorization: `Bearer ${token}`,
            }
            const res = await VillageClient.user.getOrCreateUser()

            setUser({
                id: res.id,
                workspaces: res.workspaces ?? [],
                currentWorkspace: res.workspaces?.[0],
            })
        } catch (error: any) {
            console.error(error)
        }
    }, [getAccessTokenSilently])

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

    return <UserContext.Provider value={store}>{children}</UserContext.Provider>
}

export const useUserContext = (): UserContextProps => useContext(UserContext)!
