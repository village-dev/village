import { AppState, Auth0Provider } from '@auth0/auth0-react'
import { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '@config'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Auth0ProviderWithHistory = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const navigate = useNavigate()
    const domain = AUTH0_DOMAIN
    const clientId = AUTH0_CLIENT_ID

    const onRedirectCallback = (appState?: AppState) => {
        // Use the router's history module to replace the url
        navigate(appState?.returnTo || window.location.pathname, {
            replace: true,
        })
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            redirectUri={`${window.location.origin}`}
            onRedirectCallback={onRedirectCallback}
            useRefreshTokens={true}
            audience={AUTH0_AUDIENCE}
            scope="openid profile email"
        >
            {children}
        </Auth0Provider>
    )
}

export default Auth0ProviderWithHistory
