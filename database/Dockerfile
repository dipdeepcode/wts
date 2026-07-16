FROM postgres:17.4-alpine

COPY init_db.sh /docker-entrypoint-initdb.d

RUN chmod +x /docker-entrypoint-initdb.d/init_db.sh
