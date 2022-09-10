import { getTimeSince } from '@common/dates'
import { VillageClient } from '@common/VillageClient'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Run, Schedule, ScriptWithMeta, Build } from '../../../api'
import { RunScriptEmbeddable } from './RunScript'

import { BeatLoader } from 'react-spinners'
import { Tab } from '@headlessui/react'
import { RiExternalLinkLine } from 'react-icons/ri'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

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
    const [script, setScript] = useState<ScriptWithMeta | null>(null)

    useEffect(() => {
        if (id === undefined) return
        if (script?.id === id) return

        VillageClient.scripts.getScript(id).then((s) => {
            setScript(s)
        })
    }, [id])

    const [categories] = useState({
        Builds: id ? <Builds scriptId={id} /> : <div>Loading...</div>,
        Runs: id ? <Runs scriptId={id} /> : <div>Loading...</div>,
        Schedules: id ? <Schedules scriptId={id} /> : <div>Loading...</div>,
    })

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
                        <h1 className="flex items-center text-2xl">
                            Run Script
                            <Link
                                to={`/app/run/${script.id}`}
                                className="ml-2"
                                target="_blank"
                            >
                                <RiExternalLinkLine />
                            </Link>
                        </h1>
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
            <div className="w-full py-16 px-6">
                <Tab.Group>
                    <Tab.List className="flex max-w-md space-x-1 rounded-xl bg-zinc-100 p-1">
                        {Object.keys(categories).map((category) => (
                            <Tab
                                key={category}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-zinc-700',
                                        ' focus:outline-none',
                                        selected
                                            ? 'bg-white shadow'
                                            : 'text-blue-100 hover:bg-white/80 hover:text-zinc-900'
                                    )
                                }
                            >
                                {category}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels>
                        {Object.values(categories).map((component, idx) => (
                            <Tab.Panel
                                key={idx}
                                className={classNames(
                                    'mt-4 w-full rounded-xl border bg-white p-3'
                                )}
                            >
                                {component}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    )
}
