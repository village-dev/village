default:
	@echo "No default command"
	@exit 1

generate:
	openapi-generator generate -g rust -i openapi.json -o api --additional-properties=packageName=api

install:
	cargo install --path .