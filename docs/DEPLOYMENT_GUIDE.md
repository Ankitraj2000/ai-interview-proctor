# ProctorPro Production Deployment Guide

This guide details the procedures for deploying the ProctorPro platform in a secure production-grade environment.

## 1. Prerequisites & Host Hardening

* **System Specifications**: 4 vCPUs, 8 GB RAM minimum.
* **Firewall Rules**: Open port 80 (HTTP) and 443 (HTTPS) for ingress web traffic. Port 3306 and 8080 must remain closed to the public internet and accessible only via Docker container networks.
* **Nginx TLS Configuration**: Enforce HTTPS using Let's Encrypt certificates and configure strong cipher suites.

## 2. Setting Up Environment Variables

Configure a secure `.env` file in the root workspace:

```bash
# Database parameters
MYSQL_ROOT_PASSWORD=StrongRootPassword_2026
MYSQL_DATABASE=proctor_db

# JWT Security
JWT_SECRET=U3VwZXJTZWN1cmVTaWduaW5nS2V5Rm9yU2VjdXJlQXV0aGVudGljYXRpb24yMDI2IQ==

# Mail Server Credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=recruiter@example.com
SMTP_PASSWORD=abcd-efgh-ijkl-mnop
```

## 3. Deploying using Docker Compose

Deploy the container stack in daemon mode:

```bash
docker compose -f docker-compose.yml up -d
```

Verify service availability:
```bash
bash healthcheck.sh
```
This utility returns the status of each container and details the system load statistics.
