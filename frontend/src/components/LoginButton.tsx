import { useAuth0 } from '@auth0/auth0-react'

export const LoginButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => {
    const { loginWithRedirect } = useAuth0()

    return (
        <button
            onClick={() => loginWithRedirect({ redirectUri: '/app' })}
            {...props}
        >
            {children}
        </button>
    )
}
