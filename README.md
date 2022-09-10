# Village

## Getting started

Before doing anything, make sure the following are installed:

- Node 14+
- Python 3.8+
- Poetry
- Yarn
- Docker
- Doppler

Set up Doppler by running `doppler login` and then `make setup` from the project root. Start the database (a Postgres instance on `:5432`) and Temporal by running `make dev-compose` from the project root.

Server (`/server`):

- Install dependencies by running `poetry install`
- Set up the database by running `poetry run prisma db push`
- Start the server by running `make dev`
- For Temporal to work, start the worker by running `poetry run python worker.py` (not necessary otherwise)

Frontend (`/frontend`):

- Install dependencies by running `yarn install`
- Start by running `yarn start`

Alternatively, the server and frontend can be run in Docker using `make dev-compose-full`

CLI (`/cli`):

- Install dependencies by running `yarn install`
- Build and link the CLI by running `yarn build`
