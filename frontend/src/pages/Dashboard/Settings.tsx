import { useAuth0 } from '@auth0/auth0-react'

export const Settings = () => {
    const { user } = useAuth0()

    return (
        <div className="mx-16 mt-16">
            <h1 className="text-2xl">Settings</h1>
            <div className="mt-8 flex items-center">
                {user?.picture ? (
                    <img
                        src={user?.picture}
                        alt={user?.name}
                        className="h-16 w-16 rounded-full"
                    />
                ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300" />
                )}
                <div className="ml-3 truncate text-lg font-semibold">
                    <div>{user?.name ?? 'Loading...'}</div>
                    <div className="text-zinc-400">{user?.email}</div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-lg">Notification settings</h2>
            </div>
        </div>
    )
}
