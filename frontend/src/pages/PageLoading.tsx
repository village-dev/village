import { BeatLoader } from 'react-spinners'

export const PageLoading = () => {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <BeatLoader color="rgb(52 211 153)" />
        </div>
    )
}
