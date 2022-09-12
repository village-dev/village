import { useAuth0 } from '@auth0/auth0-react'
import { toApp } from '@utils/links'

export const LoginButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => {
    const { loginWithRedirect } = useAuth0()

    return (
        <button
            onClick={() => loginWithRedirect({ redirectUri: toApp })}
            {...props}
        >
            {children}
        </button>
    )
}
