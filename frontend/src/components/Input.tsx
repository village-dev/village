export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
    className,
    ...props
}) => {
    return (
        <input
            className={`w-full rounded-lg border px-3 py-2 ${className}`}
            {...props}
        />
    )
}
