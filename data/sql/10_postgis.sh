#!/bin/bash
set -e

# Define psql command with appropriate options
psql=(psql --username "$POSTGRES_USER" --host "$POSTGRES_HOST" --port "$POSTGRES_PORT")

# Load PostGIS into the $POSTGRES_DB
echo "Loading PostGIS extensions into $POSTGRES_DB"
"${psql[@]}" --dbname="$POSTGRES_DB" <<-'EOSQL'
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_topology;
    -- Reconnect to update pg_setting.resetval
    -- See https://github.com/postgis/docker-postgis/issues/288
    \c
    CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
    CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;
EOSQL
