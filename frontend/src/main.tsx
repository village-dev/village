import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import Auth0ProviderWithHistory from '@components/Auth0ProviderWithHistory'

if (import.meta.env.MODE === 'development') {
    import('vivid-studio').then((v) => v.run())
    import('vivid-studio/style')
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Auth0ProviderWithHistory>
                <App />
            </Auth0ProviderWithHistory>
        </BrowserRouter>
    </React.StrictMode>
)
