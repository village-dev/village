import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { VillageClient } from '@common/VillageClient'
import { useUserContext } from '@contexts/UserContext'

export const NewWorkspace: React.FC = () => {
    const [name, setName] = useState('')

    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)

    const { user, setCurrentWorkspace, setWorkspaces } = useUserContext()

    const submitHandler = async (): Promise<void> => {
        setSubmitting(true)
        try {
            VillageClient.workspace
                .createWorkspace(name)
                .then(async ({ id }) => {
                    // refresh workspaces
                    const res = await VillageClient.user.getCurrentUser()

                    const newCurrentWorkspace =
                        res.workspaces?.find((w) => w.workspace_id === id) ??
                        res?.workspaces?.[0]

                    if (newCurrentWorkspace) {
                        setWorkspaces(res.workspaces ?? [])
                        setCurrentWorkspace(newCurrentWorkspace)
                    }

                    navigate('/app')
                })
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex max-w-screen-sm flex-col space-y-6 px-8 py-16">
            <div className="px-6">
                <h1 className="text-2xl">Create a workspace</h1>
            </div>
            <div className="px-6">
                <form className="flex flex-col space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Name
                        </label>
                        <input
                            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            className="mt-4 rounded-md bg-emerald-500 px-6 py-2 font-semibold text-white hover:bg-slate-200 disabled:opacity-50"
                            type="button"
                            onClick={submitHandler}
                            disabled={submitting}
                        >
                            Create workspace
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
