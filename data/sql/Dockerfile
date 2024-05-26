FROM postgres:13

RUN apt-get update \
    && apt-get install -y postgis postgresql-13-postgis-3

COPY 10_postgis.sh /docker-entrypoint-initdb.d/
COPY 20_database.sql /docker-entrypoint-initdb.d/
