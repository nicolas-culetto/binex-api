FROM postgres:16

# Variables por defecto (podés overridearlas con .env)
ENV POSTGRES_USER=nestuser
ENV POSTGRES_PASSWORD=nestpass
ENV POSTGRES_DB=nestdb

# Scripts de inicialización
COPY init.sql /docker-entrypoint-initdb.d/