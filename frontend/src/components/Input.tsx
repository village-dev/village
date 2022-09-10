export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
    className,
    ...props
}) => {
    return (
        <input
            className={`w-full rounded-lg px-3 py-2 ${className} bg-gray-50 ring-0 focus:border focus:bg-white`}
            {...props}
        />
    )
}
