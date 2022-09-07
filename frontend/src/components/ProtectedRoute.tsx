import { withAuthenticationRequired } from '@auth0/auth0-react'
import React from 'react'

export const ProtectedRoute: React.FC<{
    component: React.ComponentType<object>
    Placeholder: React.ComponentType<object>
}> = ({ component, Placeholder }) => {
    const Component = withAuthenticationRequired(component, {
        onRedirecting: () => (
            // surround in a wrapper to force rerender once authenticated
            <div key="loading-wrapper">
                <Placeholder />
            </div>
        ),
    })

    return <Component />
}
