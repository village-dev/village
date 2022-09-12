export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
    className,
    ...props
}) => {
    return (
        <input
            className={`w-full rounded-lg bg-gray-50 px-3 py-2 focus:bg-white ${className}`}
            {...props}
        />
    )
}
