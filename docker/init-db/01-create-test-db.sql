-- Second database for Jest / CI — runs once on first Postgres container start
SELECT 'CREATE DATABASE doctor_crm_test OWNER doctorcrm'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'doctor_crm_test')\gexec

GRANT ALL PRIVILEGES ON DATABASE doctor_crm_test TO doctorcrm;
