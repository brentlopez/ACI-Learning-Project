FROM postgres
COPY init.sql /docker-entrypoint-initdb.d/
ENV POSTGRES_USER=user POSTGRES_PASSWORD=not_a_very_secure_password