import { VillageClient } from '@common/VillageClient'
import { Params, ParsedParams } from '@components/Params'
import { PageLoading } from '@pages/PageLoading'
import { useEffect, useState } from 'react'
import 'react-datetime/css/react-datetime.css'
import { useParams } from 'react-router-dom'
import { ScriptWithMeta } from '../../../api'

export const RunScriptEmbeddable: React.FC<{ script: ScriptWithMeta }> = ({
    script,
}) => {
    const [output, setOutput] = useState<string | null>(null)

    const [params, setParams] = useState<Record<string, string | null>>({})
    const [parsedParams, setParsedParams] = useState<ParsedParams>({})

    const submitScript = () => {
        VillageClient.scripts
            .runScript({ script_id: script.id, params: parsedParams })
            .then((r) => {
                setOutput(r.output)
            })
    }

    return (
        <>
            <Params
                scriptParams={script?.builds?.[0]?.params || []}
                params={params}
                setParams={setParams}
                setParsedParams={setParsedParams}
            />
            <button
                onClick={submitScript}
                className="mt-8 w-full rounded-md bg-emerald-500 py-2 font-medium text-white"
            >
                Run script
            </button>
            {output !== null && (
                <div>
                    <h2 className="mt-8 text-lg">Output</h2>
                    <pre className="mt-2 rounded-md bg-gray-100 p-4 text-sm">
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
        return <PageLoading />
    }

    return (
        <div className="max-w-screen-md space-y-6 px-8 py-16">
            <h1 className="text-2xl">Run Script</h1>
            <RunScriptEmbeddable script={script} />
        </div>
    )
}
