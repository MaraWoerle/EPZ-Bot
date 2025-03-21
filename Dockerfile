FROM python:3.13.2-alpine

WORKDIR /epz-bot

RUN apk add mariadb-connector-c mariadb-connector-c-dev build-base

COPY pyproject.toml README.md ./
ADD src ./src

RUN pip install .

ENTRYPOINT [ "start" ]