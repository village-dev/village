import { ScaleLoader } from 'react-spinners'

export const PageLoading = () => {
    return (
        <div className="flex h-full w-full items-center justify-center py-48">
            <ScaleLoader color="rgb(52 211 153)" />
        </div>
    )
}
