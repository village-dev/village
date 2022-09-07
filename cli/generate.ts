import * as OpenAPI from 'openapi-typescript-codegen'

OpenAPI.generate({
    input: './openapi.json',
    output: './api',
    clientName: 'VillageClient',
    httpClient: 'axios',
})
