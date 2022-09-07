import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Run, Schedule, ScriptWithBuild, Build } from '../../../api'
import { RunScriptEmbeddable } from './RunScript'

import { BeatLoader } from 'react-spinners'

export const Builds: React.FC<{ scriptId: string }> = ({ scriptId }) => {
    const [builds, setBuilds] = useState<Build[] | null>(null)
    // const [, setRunning] = useState(false)
    // const [runId, setRunId] = useState<string | null>(null)

    useEffect(() => {
        VillageClient.scripts.getScriptBuilds(scriptId).then((b) => {
            setBuilds(b)
        })
    }, [scriptId])

    if (builds === null) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex-col space-y-2">
            <div className="my-4 flex px-6 font-semibold">
                <div className="w-64">
                    <h2>Build ID</h2>
                </div>
                <div className="w-96">
                    <h2>Status</h2>
                </div>
                <div className="w-32">
                    <h2>Time</h2>
                </div>
            </div>
            {builds.map((build) => {
                return (
                    <Link
                        key={build.id}
                        to={`/build/${build.id}`}
                        className="flex border-b-2 border-transparent px-6 hover:border-slate-200 hover:bg-slate-50"
                    >
                        <div className="w-64">
                            <p>{build.id}</p>
                        </div>
                        <div className="w-96">
                            <p>{build.status}</p>
                        </div>
                        <div className="w-32">
                            <p>{getTimeSince(build.created_at)}</p>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

export const Runs: React.FC<{ scriptId: string }> = ({ scriptId }) => {
    const [runs, setRuns] = useState<Run[] | null>(null)

    useEffect(() => {
        VillageClient.scripts.getScriptRuns(scriptId).then((r) => {
            setRuns(r)
        })
    }, [scriptId])

    if (runs === null) {
        return <div>Loading...</div>
    }

    return (
        <div className="flex-col space-y-2">
            <div className="my-4 flex px-6 font-semibold">
                <div className="w-64">
                    <h2>Run ID</h2>
                </div>
                <div className="w-96">
                    <h2>Status</h2>
                </div>
                <div className="w-32">
                    <h2>Time</h2>
                </div>
            </div>
            {runs.map((run) => {
                return (
                    <Link
                        key={run.id}
                        to={`/build/${run.id}`}
                        className="flex border-b-2 border-transparent px-6 hover:border-slate-200 hover:bg-slate-50"
                    >
                        <div className="w-64">
                            <p>{run.id}</p>
                        </div>
                        <div className="w-96">
                            <p>{run.status}</p>
                        </div>
                        <div className="w-32">
                            <p>{getTimeSince(run.created_at)}</p>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

export const Schedules: React.FC<{ scriptId: string }> = ({ scriptId }) => {
    const [schedules, setSchedules] = useState<Schedule[] | null>(null)

    useEffect(() => {
        VillageClient.scripts.getScriptSchedules(scriptId).then((r) => {
            setSchedules(r)
        })
    }, [scriptId])

    if (schedules === null) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                Loading...
            </div>
        )
    }

    return (
        <div className="flex-col space-y-2">
            <div className="my-4 flex px-6 font-semibold">
                <div className="w-64">
                    <h2>Schedule ID</h2>
                </div>
                <div className="w-96">
                    <h2>Schedule</h2>
                </div>
                <div className="w-32">
                    <h2>Time</h2>
                </div>
            </div>
            {schedules.map((schedule) => {
                return (
                    <Link
                        key={schedule.id}
                        to={`/build/${schedule.id}`}
                        className="flex border-b-2 border-transparent px-6 hover:border-slate-200 hover:bg-slate-50"
                    >
                        <div className="w-64">
                            <p>{schedule.id}</p>
                        </div>
                        <div className="w-96">
                            <p>
                                {schedule.minute} {schedule.hour}{' '}
                                {schedule.day_of_month} {schedule.month_of_year}{' '}
                                {schedule.day_of_week}
                            </p>
                        </div>
                        <div className="w-32">
                            <p>{getTimeSince(schedule.created_at)}</p>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

export const Script: React.FC = () => {
    const { id } = useParams()
    const [script, setScript] = useState<ScriptWithBuild | null>(null)
    // const [, setRunning] = useState(false)
    // const [runId, setRunId] = useState<string | null>(null)

    useEffect(() => {
        if (id === undefined) return
        if (script?.id === id) return

        VillageClient.scripts.getScript(id).then((s) => {
            setScript(s)
        })
    }, [id])

    if (id === undefined) {
        return <div>No script selected</div>
    }

    if (script === null) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <BeatLoader color="rgb(52 211 153)" />
            </div>
        )
    }

    const isDeployed = (script.builds || []).length > 0

    return (
        <div className="flex flex-col space-y-6 px-8 py-16">
            <div className="flex flex-col space-y-6 px-6">
                <h1 className="text-2xl">{script.name}</h1>
                <p>{script.description}</p>
                <h3 className="text-slate-600">
                    Created {getTimeSince(script.created_at)}
                </h3>
                {isDeployed ? (
                    <div className="rounded-lg border p-8">
                        <h1 className="text-2xl">Run Script</h1>
                        <RunScriptEmbeddable script={script} />
                    </div>
                ) : (
                    <div className="rounded-lg border border-yellow-400 bg-yellow-100 p-8 text-lg">
                        This script is not deployed yet! To set it up locally,
                        run
                        <div className="mt-4 rounded-md border bg-zinc-50 p-4 text-gray-700">
                            <code>village setup {script.id}</code>
                        </div>
                    </div>
                )}
            </div>
            <div>
                <h1 className="px-6 text-2xl">Builds</h1>
                <Builds scriptId={script.id} />
            </div>
            <div>
                <h1 className="px-6 text-2xl">Runs</h1>
                <Runs scriptId={script.id} />
            </div>
            <div>
                <h1 className="px-6 text-2xl">Schedules</h1>
                <Schedules scriptId={script.id} />
            </div>
        </div>
    )
}
