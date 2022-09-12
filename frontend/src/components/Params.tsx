import { Input } from '@components/Input'
import { Select } from '@components/Select'
import { Switch } from '@headlessui/react'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import Datetime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import { Param, ParamType } from '../../api'

interface Option {
    value: string
    label: string
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
            className="rounded-none rounded-r-lg"
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
            className="rounded-none rounded-r-lg"
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
            className="rounded-none rounded-r-lg"
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
    // multiple lines
    if (
        [
            ParamType.BIGSTRING,
            ParamType.BOOLEAN,
            ParamType.DATE,
            ParamType.DATETIME,
        ].includes(param.type)
    ) {
        return (
            <div className="mt-4 w-full items-center">
                <h2 className="whitespace-nowrap rounded-l-lg border px-2 py-1.5">
                    {param.key}{' '}
                    {param.required && (
                        <span className="font-semibold text-red-500">*</span>
                    )}
                </h2>
                {<BigStringInput value={value} setValue={setValue} />}
            </div>
        )
    }

    const InnerInput = {
        [ParamType.BIGSTRING]: StringInput,
        [ParamType.STRING]: StringInput,
        [ParamType.INTEGER]: IntegerInput,
        [ParamType.FLOAT]: FloatInput,
        [ParamType.BOOLEAN]: BooleanInput,
        [ParamType.DATE]: DateInput,
        [ParamType.DATETIME]: DateTimeInput,
    }[param.type]

    return (
        <div className="mt-4 flex w-full items-center">
            <h2 className="content-box whitespace-nowrap rounded-l-lg border border-gray-100 px-4 py-1.5">
                {param.key}{' '}
                {param.required && (
                    <span className="font-semibold text-red-500">*</span>
                )}
            </h2>
            {<InnerInput value={value} setValue={setValue} />}
        </div>
    )
}

export type ParsedParams = Record<string, string | number | boolean>

export const Params: React.FC<{
    scriptParams: Param[]
    params: Record<string, string | null>
    setParams: (values: Record<string, string | null>) => void
    setParsedParams: (params: ParsedParams) => void
}> = ({ scriptParams, params, setParams, setParsedParams }) => {
    const setParamValue =
        ({ key }: { key: string }) =>
        (value: string) => {
            setParams({
                ...params,
                [key]: value,
            })
        }

    useEffect(() => {
        setParams(
            Object.fromEntries(
                scriptParams.map((p) => {
                    if (p.default) {
                        return [p.key, p.default]
                    }

                    return [p.key, null]
                })
            )
        )
    }, [scriptParams])

    const paramsByKey: Record<string, Param> = useMemo(() => {
        const paramEntries = scriptParams.map((param) => [param.key, param])
        return Object.fromEntries(paramEntries)
    }, [scriptParams])

    useEffect(() => {
        const parsed: ParsedParams = {}
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

            parsed[key] = parsedValue
        })

        setParsedParams(parsed)
    }, [params])

    return (
        <>
            {scriptParams.map((param) => (
                <ParamInput
                    param={param}
                    value={params[param.key]}
                    setValue={setParamValue({
                        key: param.key,
                    })}
                />
            ))}
        </>
    )
}
