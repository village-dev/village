export const Textarea: React.FC<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ className, ...props }) => {
    return (
        <textarea
            className={`w-full rounded-lg border px-3 py-2 ${className}`}
            {...props}
        />
    )
}
