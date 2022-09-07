import { useAuth0 } from '@auth0/auth0-react'

export const LogoutButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => {
    const { logout } = useAuth0()

    return (
        <button onClick={() => logout()} {...props}>
            {children}
        </button>
    )
}
