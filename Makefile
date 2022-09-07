default:
	@echo "No default command"
	@exit 1

setup:
	doppler setup -p village -c dev

dev-compose:
	cd docker && docker compose --file compose-dev.yml up --build

dev-compose-full:
	cd docker && docker compose --file compose-dev.yml --file frontend-dev.yml --file server-dev.yml up --build