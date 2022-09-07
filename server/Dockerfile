FROM python:3.8

WORKDIR /app

ENV POETRY_VIRTUALENVS_CREATE=false \
    POETRY_VERSION=1.1.11 \
    YOUR_ENV=development

# for make
RUN apt-get update
RUN apt-get install make
RUN apt-get install -y openssl direnv

RUN python3 -m pip install poetry==$POETRY_VERSION

ENV PATH "/root/.local/bin:$PATH"

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-interaction --no-ansi

RUN poetry run prisma generate

COPY . .
