import { VillageClient } from '@common/VillageClient'
import { Input } from '@components/Input'
import { Select } from '@components/Select'
import { Switch } from '@headlessui/react'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { useParams } from 'react-router-dom'
import { BeatLoader } from 'react-spinners'
import { Param, ParamType, ScriptWithMeta } from '../../../api'

interface Option {
    value: string
    label: string
}

interface InputProps {
    value: string
    setValue: (v: string) => void
}

export const StringInput: React.FC<{
    value: string | null
    setValue: (v: string) => void
}> = ({ value, setValue }) => {
    return (
        <Input
            value={value ?? ''}
            onChange={(e) => {
                setValue(e.target.value)
            }}
        />
    )
}

export const BigStringInput: React.FC<{
    value: string | null
    setValue: (v: string) => void
}> = ({ value, setValue }) => {
    return (
        <textarea
            className="w-full rounded-lg border px-2 py-2"
            value={value ?? ''}
            onChange={(e) => {
                setValue(e.target.value)
            }}
            rows={3}
        />
    )
}

export const FloatInput: React.FC<{
    value: string | null
    setValue: (v: string) => void
}> = ({ value, setValue }) => {
    return (
        <Input
            value={value ?? ''}
            onChange={(e) => {
                setValue(e.target.value)
            }}
        />
    )
}

export const IntegerInput: React.FC<{
    value: string | null
    setValue: (v: string) => void
}> = ({ value, setValue }) => {
    return (
        <Input
            value={value ?? ''}
            onChange={(e) => {
                setValue(e.target.value)
            }}
        />
    )
}

export const BooleanInput: React.FC<{
    value: string | null
    setValue: (v: string) => void
}> = ({ value, setValue }) => {
    const enabled = value === 'true'
    const setEnabled = (v: boolean) => setValue(v ? 'true' : 'false')

    return (
        <Switch
            checked={enabled}
            onChange={setEnabled}
            className={`${
                enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
            <span className="sr-only">Enable notifications</span>
            <span
                className={`${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white`}
            />
        </Switch>
    )
}

const dateFormat = 'MMMM DD, YYYY'
const datetimeFormat = 'MMMM DD, YYYY hh:mm A'

export const DateInput: React.FC<{
    value: string | null
    setValue: (v: string) => void
}> = ({ value, setValue }) => {
    return (
        <Datetime
            value={moment(value, dateFormat)}
            onChange={(v) => {
                if (moment.isMoment(v)) {
                    setValue(v.format(dateFormat))
                } else {
                    setValue(v)
                }
            }}
            dateFormat={dateFormat}
            // timeFormat="HH:mm a"
            inputProps={{
                className:
                    'border border-gray-300 py-2 px-3 rounded-md shadow-sm w-full focus:outline-none focus:shadow-outline-blue focus:border-blue-300',
            }}
            timeFormat={false}
        />
    )
}

export const DateTimeInput: React.FC<{
    value: string | null
    setValue: (v: string) => void
}> = ({ value, setValue }) => {
    return (
        <Datetime
            value={moment(value, datetimeFormat)}
            onChange={(v) => {
                if (moment.isMoment(v)) {
                    setValue(v.format(datetimeFormat))
                } else {
                    setValue(v)
                }
            }}
            dateFormat="MMMM DD, YYYY"
            timeFormat="HH:mm a"
            inputProps={{
                className:
                    'border border-gray-300 py-2 px-3 rounded-md shadow-sm w-full focus:outline-none focus:shadow-outline-blue focus:border-blue-300',
            }}
        />
    )
}

export const OptionsSelect: React.FC<{
    param: Param
    updateParam: () => void
}> = ({ param }) => {
    const options: Option[] = param.options.map((value) => JSON.parse(value))

    const [selected, setSelected] = useState(options[0])

    return (
        <Select
            options={options}
            selected={selected}
            setSelected={setSelected}
        />
    )
}

export const ParamInput: React.FC<{
    param: Param
    value: string | null
    setValue: (value: string) => void
}> = ({ param, value, setValue }) => {
    const InnerInput = {
        [ParamType.STRING]: StringInput,
        [ParamType.BIGSTRING]: BigStringInput,
        [ParamType.INTEGER]: IntegerInput,
        [ParamType.FLOAT]: FloatInput,
        [ParamType.BOOLEAN]: BooleanInput,
        [ParamType.DATE]: DateInput,
        [ParamType.DATETIME]: DateTimeInput,
    }[param.type]

    return (
        <div className="mt-4 w-full">
            <h2>
                {param.key}{' '}
                {param.required && (
                    <span className="font-semibold text-red-500">*</span>
                )}
            </h2>
            {<InnerInput value={value} setValue={setValue} />}
        </div>
    )
}

type ParsedParams = Record<string, string | number | boolean>

export const RunScriptEmbeddable: React.FC<{ script: ScriptWithMeta }> = ({
    script,
}) => {
    const [scriptParams, setScriptParams] = useState<Param[]>([])
    const [params, setParams] = useState<Record<string, string | null>>({})

    const paramsByKey: Record<string, Param> = useMemo(() => {
        const paramEntries = scriptParams.map((param) => [param.key, param])
        return Object.fromEntries(paramEntries)
    }, [scriptParams])

    const [output, setOutput] = useState<string | null>(null)

    const setParamValue =
        ({ key }: { key: string }) =>
        (value: string) => {
            setParams({
                ...params,
                [key]: value,
            })
        }

    useEffect(() => {
        const p = script?.builds?.[0]?.params || []
        setScriptParams(p)
        setParams(
            Object.fromEntries(
                p.map((p) => {
                    if (p.default) {
                        return [p.key, p.default]
                    }

                    return [p.key, null]
                })
            )
        )
    }, [script])

    const submitScript = () => {
        const validParams: ParsedParams = {}
        Object.entries(params).forEach(([key, value]) => {
            if (value === null) return

            const type = paramsByKey[key].type

            let parsedValue: string | number | boolean = value

            if (type === ParamType.INTEGER) {
                parsedValue = parseInt(value)
            }
            if (type === ParamType.FLOAT) {
                parsedValue = parseFloat(value)
            }
            if (type === ParamType.BOOLEAN) {
                parsedValue = value === 'true'
            }

            validParams[key] = parsedValue
        })
        VillageClient.scripts
            .runScript({ script_id: script.id, params: validParams })
            .then((r) => {
                setOutput(r.output)
            })
    }

    return (
        <>
            {scriptParams.map((param, idx) => (
                <ParamInput
                    key={idx}
                    param={param}
                    value={params[param.key]}
                    setValue={setParamValue({
                        key: param.key,
                    })}
                />
            ))}
            <button
                onClick={submitScript}
                className="mt-4 w-full rounded-md bg-indigo-500 py-2 font-medium text-white"
            >
                Run script
            </button>
            {output !== null && (
                <div>
                    <h2 className="text-2xl">Output</h2>
                    <pre className="mt-2 rounded-md bg-gray-100 p-2 text-sm">
                        {output}
                    </pre>
                </div>
            )}
        </>
    )
}

export const RunScriptStandalone = () => {
    const { id } = useParams()
    const [script, setScript] = useState<ScriptWithMeta | null>(null)

    useEffect(() => {
        if (id === undefined) return
        if (script?.id === id) return

        VillageClient.scripts.getScript(id).then((s) => {
            setScript(s)
        })
    }, [])

    if (script === null) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <BeatLoader color="rgb(52 211 153)" />
            </div>
        )
    }

    return (
        <div className="max-w-screen-md space-y-6 px-8 py-16">
            <h1 className="text-2xl">Run Script</h1>
            <RunScriptEmbeddable script={script} />
        </div>
    )
}
