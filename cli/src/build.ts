import * as esbuild from 'esbuild'

import dotenv from 'dotenv'

dotenv.config({
    path:
        process.env.NODE_ENV === 'PRODUCTION'
            ? '.env.production'
            : '.env.development',
})

const die = (err: string) => {
    throw new Error(`env config missing: ${err}`)
}

const getEnv = (name: string): string => {
    return `'${process.env[name]}'` || die(name)
}

esbuild.buildSync({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    platform: 'node',
    target: ['node16'],
    outfile: './dist/index.js',
    external: ['esbuild'],
    minify: true,
    define: {
        'process.env.API_BASE_URL': getEnv('API_BASE_URL'),
        'process.env.AUTH0_DOMAIN': getEnv('AUTH0_DOMAIN'),
        'process.env.AUTH0_CLIENT_ID': getEnv('AUTH0_CLIENT_ID'),
        'process.env.AUTH0_AUDIENCE': getEnv('AUTH0_AUDIENCE'),
    },
})
