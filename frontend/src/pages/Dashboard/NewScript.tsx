import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Engine } from '../../../api'

import { VillageClient } from '@common/VillageClient'
import { Option, Select } from '@components/Select'
import { useUserContext } from '@contexts/UserContext'
import { debounce } from '@utils/debounce'

const engineLabels = [
    { value: Engine.PYTHON, label: 'Python' },
    { value: Engine.NODE, label: 'Node' },
]

// ensure this is in sync with cli/src/commands/init.ts
const engineVersions: { [key in Engine]: Option[] } = {
    [Engine.NODE]: [
        { label: '16', value: '16' },
        { label: '17', value: '17' },
        { label: '18', value: '18' },
    ],
    [Engine.PYTHON]: [
        { label: '3.7', value: '3.7' },
        { label: '3.8', value: '3.8' },
        { label: '3.9', value: '3.9' },
    ],
}

export const NewScript: React.FC = () => {
    const [title, setTitle] = useState('')
    const [id, setId] = useState('')
    const [idAvailable, setIdAvailable] = useState(true)
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [manualId, setManualId] = useState(false)

    const { user } = useUserContext()

    const navigate = useNavigate()

    const [engine, setEngine] = useState<Option>(engineLabels[0])
    const [engineVersion, setEngineVersion] = useState<Option>(
        engineVersions[engine.value as Engine][0]
    )

    useEffect(() => {
        setEngineVersion(engineVersions[engine.value as Engine][0])
    }, [engine])

    const proposeId = useRef(
        debounce(async (title: string) => {
            VillageClient.scripts.proposeId(title).then((newId) => {
                setId(newId)
            })
        }, 500)
    ).current

    const checkId = useRef(
        debounce(async (id: string) => {
            VillageClient.scripts.checkId(id).then((available) => {
                setIdAvailable(available)
            })
        }, 500)
    ).current

    useEffect(() => {
        !manualId && proposeId(title)
    }, [title])

    useEffect(() => {
        checkId(id)
    }, [id])

    const submitHandler = async (): Promise<void> => {
        // POST TASK
        setSubmitting(true)
        try {
            if (!user?.currentWorkspace?.workspace_id) {
                throw new Error('No workspace selected')
            }

            VillageClient.scripts
                .createScript({
                    name: title,
                    id: id === '' ? undefined : id,
                    description,
                    engine: engine.value as Engine,
                    engine_version: engineVersion.value,
                    workspace_id: user.currentWorkspace?.workspace_id, // TODO: make this the current workspace
                })
                .then((s) => {
                    // redirect to script page
                    navigate(`/app/scripts/${s.id}`)
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
                <h1 className="text-2xl">Create a script</h1>
            </div>
            <div className="px-6">
                <form className="flex flex-col space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Title
                        </label>
                        <input
                            id="title"
                            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Identifier
                        </label>
                        <input
                            id="id"
                            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                            placeholder="Identifier"
                            value={id}
                            onChange={(e) => {
                                setId(e.target.value)
                                setManualId(true)
                            }}
                        />
                        {idAvailable ? (
                            <p className="mt-1 text-sm text-emerald-500">
                                This ID is available
                            </p>
                        ) : (
                            <p className="mt-1 text-sm text-red-500">
                                This ID is not available
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="title"
                            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Runtime
                        </label>
                        <div className="flex flex-row space-x-4">
                            <Select
                                options={engineLabels}
                                selected={engine}
                                setSelected={setEngine}
                            />
                            <Select
                                options={engineVersions[engine.value as Engine]}
                                selected={engineVersion}
                                setSelected={setEngineVersion}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            className="mt-4 rounded-md bg-emerald-500 px-6 py-2 font-semibold text-white hover:bg-slate-200 disabled:opacity-50"
                            type="button"
                            onClick={submitHandler}
                            disabled={submitting}
                        >
                            Register script
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}