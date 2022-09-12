export const NoSchedules: React.FC = () => {
    return (
        <div className="mt-10 flex h-full flex-col items-center justify-center rounded-xl bg-gray-50 py-8 px-8">
            <h1 className="text-2xl font-semibold text-black">
                No schedules yet!
            </h1>
            <p className="text-md mt-8 text-gray-600">
                Get started by looking at our{' '}
                <a
                    href="http://docs.village.dev"
                    className="text-green underline-offset-4 hover:underline"
                >
                    Documentation.
                </a>
            </p>
        </div>
    )
}
