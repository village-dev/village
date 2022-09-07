default:
	@echo "No default command"
	@exit 1

ci: generate black-check isort-check pyright check-openapi-json

migrate:
	poetry run prisma migrate dev

generate:
	poetry run prisma generate

dev: generate
	doppler run --command "poetry run uvicorn main:app --reload --host 127.0.0.1 --port 8000"

black-check:
	poetry run black --check .

isort-check:
	poetry run isort --check-only --diff .

pyright:
	poetry run pyright

check-openapi-files:
	poetry run python main.py
	git diff --exit-code ../frontend/openapi.json
	git diff --exit-code ../cli/openapi.json
	git diff --exit-code ../docs/openapi.yaml
