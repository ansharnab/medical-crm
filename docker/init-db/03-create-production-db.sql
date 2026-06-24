-- Production database — runs once on first Postgres container start
SELECT 'CREATE DATABASE doctor_crm_production OWNER doctorcrm'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'doctor_crm_production')\gexec

GRANT ALL PRIVILEGES ON DATABASE doctor_crm_production TO doctorcrm;
