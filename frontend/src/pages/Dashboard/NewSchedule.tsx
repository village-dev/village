import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { VillageClient } from '@common/VillageClient'
import { Option, Select } from '@components/Select'
import { useUserContext } from '@contexts/UserContext'
import cronParser from 'cron-parser'
import cronstrue from 'cronstrue'
import { ScriptWithMeta } from '../../../api'
import { Params, ParsedParams } from '@components/Params'
import { toNewScript, toSchedule } from '@utils/links'

export const NewSchedule: React.FC = () => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [selectedScript, setSelectedScript] = useState<Option | null>(null)
    const [selectedScriptData, setSelectedScriptData] =
        useState<ScriptWithMeta | null>(null)

    const [params, setParams] = useState<Record<string, string | null>>({})
    const [parsedParams, setParsedParams] = useState<ParsedParams>({})

    const [scripts, setScripts] = useState<Option[]>([])

    const { user } = useUserContext()

    useEffect(() => {
        if (!user?.currentWorkspace?.workspace_id) return
        VillageClient.scripts
            .listScripts(user?.currentWorkspace?.workspace_id)
            .then((scripts) => {
                const s = scripts.map((script) => ({
                    label: script.name,
                    value: script.id,
                }))
                setScripts(s)
                setSelectedScript(s[0])
            })
    }, [user?.currentWorkspace])

    useEffect(() => {
        if (selectedScript?.value === undefined) return
        if (selectedScriptData?.id === selectedScript?.value) return

        VillageClient.scripts.getScript(selectedScript?.value).then((s) => {
            setSelectedScriptData(s)
        })
    }, [])

    const [submitting, setSubmitting] = useState(false)

    const [minute, setMinute] = useState('0')
    const [hour, setHour] = useState('*')
    const [dayOfMonth, setDayOfMonth] = useState('*')
    const [monthOfYear, setMonthOfYear] = useState('*')
    const [dayOfWeek, setDayOfWeek] = useState('*')
    const [cronExpression, setCronExpression] = useState('')
    const [nextRuns, setNextRuns] = useState<cronParser.CronDate[]>([])

    useEffect(() => {
        const cron = `${minute} ${hour} ${dayOfMonth} ${monthOfYear} ${dayOfWeek}`
        try {
            setCronExpression(cronstrue.toString(cron))
        } catch {
            setCronExpression('Invalid cron expression')
        }

        try {
            const interval = cronParser.parseExpression(cron)
            const nextRuns = []
            for (let i = 0; i < 3; i++) {
                nextRuns.push(interval.next())
            }
            setNextRuns(nextRuns)
        } catch {
            setNextRuns([])
        }
    }, [minute, hour, dayOfMonth, monthOfYear, dayOfWeek])

    const navigate = useNavigate()

    const submitHandler = async (): Promise<void> => {
        setSubmitting(true)
        if (selectedScript === null) return
        try {
            VillageClient.schedules
                .createSchedule({
                    name: name,
                    description,
                    script_id: selectedScript.value,
                    minute,
                    hour,
                    day_of_month: dayOfMonth,
                    month_of_year: monthOfYear,
                    day_of_week: dayOfWeek,
                    params: parsedParams,
                })
                .then((s) => {
                    // redirect to schedule page
                    navigate(toSchedule(s.id))
                })
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    const labelStyle = 'block text-sm font-bold text-gray-700'
    const inputStyle =
        'focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'

    const cronInputStyle =
        'focus:shadow-outline w-24 appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'
    const cronBlockStyle = 'p-4'

    return (
        <>
            <div className="px-6">
                <h1 className="text-2xl">Create a schedule</h1>
            </div>
            <div className="px-6">
                <form className="flex flex-col space-y-4">
                    <div>
                        <label className={labelStyle}>Name</label>
                        <input
                            id="name"
                            className={inputStyle}
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>Script</label>
                        {scripts.length > 0 ? (
                            <Select
                                options={scripts}
                                selected={selectedScript || scripts[0]}
                                setSelected={setSelectedScript}
                            />
                        ) : (
                            <div className="max-w-max rounded-md bg-gray-100 px-3 py-1.5 text-sm">
                                No scripts available. Create one{' '}
                                <Link
                                    className="font-semibold text-emerald-500"
                                    to={toNewScript}
                                >
                                    here
                                </Link>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className={labelStyle}>Description</label>
                        <textarea
                            id="title"
                            className={inputStyle}
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div className="rounded-lg border p-4">
                        <h2>Parameters</h2>
                        <Params
                            scriptParams={
                                selectedScriptData?.builds?.[0]?.params || []
                            }
                            params={params}
                            setParams={setParams}
                            setParsedParams={setParsedParams}
                        />
                    </div>
                    <div>
                        <label className={labelStyle}>Schedule</label>
                        <div className="border-md mt-2  rounded-lg border p-4">
                            <div className="flex flex-row flex-wrap items-end">
                                <div className={cronBlockStyle}>
                                    <label className={labelStyle}>Minute</label>
                                    <input
                                        className={cronInputStyle}
                                        placeholder={'*'}
                                        value={minute}
                                        onChange={(e) =>
                                            setMinute(e.target.value)
                                        }
                                    />
                                </div>
                                <div className={cronBlockStyle}>
                                    <label className={labelStyle}>Hour</label>
                                    <input
                                        className={cronInputStyle}
                                        placeholder={'*'}
                                        value={hour}
                                        onChange={(e) =>
                                            setHour(e.target.value)
                                        }
                                    />
                                </div>
                                <div className={cronBlockStyle}>
                                    <label className={labelStyle}>
                                        Day of month
                                    </label>
                                    <input
                                        className={cronInputStyle}
                                        placeholder={'*'}
                                        value={dayOfMonth}
                                        onChange={(e) =>
                                            setDayOfMonth(e.target.value)
                                        }
                                    />
                                </div>
                                <div className={cronBlockStyle}>
                                    <label className={labelStyle}>Month</label>
                                    <input
                                        className={cronInputStyle}
                                        placeholder={'*'}
                                        value={monthOfYear}
                                        onChange={(e) =>
                                            setMonthOfYear(e.target.value)
                                        }
                                    />
                                </div>
                                <div className={cronBlockStyle}>
                                    <label className={labelStyle}>
                                        Day of Week
                                    </label>
                                    <input
                                        className={cronInputStyle}
                                        placeholder={'*'}
                                        value={dayOfWeek}
                                        onChange={(e) =>
                                            setDayOfWeek(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="px-4 py-2 font-semibold text-emerald-500">
                                {cronExpression}
                            </div>
                            <div className="px-4 py-2">
                                Next runs:
                                {nextRuns.map((r, idx) => (
                                    <div key={idx} className="text-zinc-500">
                                        {r.toDate().toLocaleString()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            className="mt-4 rounded-md bg-emerald-500 px-6 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                            type="button"
                            onClick={submitHandler}
                            disabled={submitting}
                        >
                            Create schedule
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
