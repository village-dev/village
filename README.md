# Village

## Getting started

Before doing anything, make sure the following are installed:

- Node 14+
- Python 3.8+
- Poetry
- Yarn
- Docker
- Doppler
- Pulumi

Set up Doppler by running `doppler login` and then `make setup` from the project root. Start the database (a Postgres instance on `:5432`) and Temporal by running `make dev-compose` from the project root.

Server (`/server`):

- Install dependencies by running `poetry install`
- Set up the database by running `poetry run prisma db push`
- Start the server by running `make dev`

Frontend (`/frontend`):

- Install dependencies by running `yarn install`
- Start by running `yarn start`

Alternatively, the server and frontend can be run in Docker using `make dev-compose-full`

CLI (`/cli`):

- Install dependencies by running `yarn install`
- Build and link the CLI by running `yarn build`

Auth0 (`/auth0`):

- Currently, this houses an Auth0 action that triggers on registration of a new user
- To run this with a local setup, use a reverse proxy such as ngrok.
- Start the db & server locally and run `ngrok http 8000`
- Set `PROXY_ADDRESS` and deploy the action from Auth0 > Actions > Library > Post User Registration
