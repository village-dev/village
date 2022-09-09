import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { VillageClient } from '@common/VillageClient'
import { useUserContext } from '@contexts/UserContext'
import { debounce } from '@utils/debounce'
import { BeatLoader } from 'react-spinners'
import { Input } from '@components/Input'

export const NewWorkspace: React.FC = () => {
    const [name, setName] = useState('')

    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)

    const [id, setId] = useState('')
    const [idAvailable, setIdAvailable] = useState<boolean | null>(null)

    const [manualId, setManualId] = useState(false)
    const [proposingId, setProposingId] = useState(false)

    const { setCurrentWorkspace, setWorkspaces } = useUserContext()

    const proposeId = useRef(
        debounce(async (title: string) => {
            setProposingId(true)
            VillageClient.workspace.proposeId(title).then((newId) => {
                setId(newId)
                setProposingId(false)
            })
        }, 500)
    ).current

    const checkId = useRef(
        debounce(async (id: string) => {
            VillageClient.workspace.checkId(id).then((available) => {
                setIdAvailable(available)
            })
        }, 500)
    ).current

    useEffect(() => {
        if (name.length === 0) {
            setIdAvailable(null)
        } else {
            !manualId && proposeId(name)
        }
    }, [name])

    useEffect(() => {
        if (id.length === 0) {
            setIdAvailable(null)
        } else {
            checkId(id)
        }
    }, [id])

    const submitHandler = async (): Promise<void> => {
        setSubmitting(true)
        try {
            VillageClient.workspace
                .createWorkspace({ name, id })
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

    let idStatus: React.ReactNode | null = null

    if (idAvailable === true) {
        idStatus = (
            <p className="mt-1 text-sm text-emerald-500">
                This ID is available
            </p>
        )
    } else if (idAvailable === false) {
        idStatus = (
            <p className="mt-1 text-sm text-red-500">
                This ID is not available
            </p>
        )
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
                        <Input
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-2 flex items-center text-sm font-bold text-gray-700">
                            Identifier{' '}
                            {proposingId && (
                                <BeatLoader
                                    className="ml-2"
                                    size={8}
                                    color="rgb(156 163 175)"
                                />
                            )}
                        </label>
                        <Input
                            id="id"
                            placeholder="Identifier"
                            value={id}
                            onChange={(e) => {
                                setId(e.target.value)
                                setManualId(true)
                            }}
                            disabled={proposingId}
                        />
                        {idStatus}
                    </div>
                    <div>
                        <button
                            className="mt-4 rounded-md bg-emerald-500 px-6 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
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
