interface ImportMetaEnv {
    readonly MODE: 'development' | 'production'
    readonly VITE_API_BASE_URL: string
    readonly VITE_AUTH0_DOMAIN: string
    readonly VITE_AUTH0_CLIENT_ID: string
    readonly VITE_AUTH0_AUDIENCE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
