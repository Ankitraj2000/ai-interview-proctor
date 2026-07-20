#!/bin/bash
# ProctorPro Platform - System Health & Diagnostic Utility

echo "======================================================================"
echo "          PROCTORPRO ASSESSMENT PLATFORM HEALTH DIAGNOSTIC            "
echo "======================================================================"
date
echo ""

# 1. Check docker containers status
echo "--- Docker Containers Status ---"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Check system usage metrics
echo "--- Host System Diagnostics ---"
if command -v free &> /dev/null; then
    free -h
else
    echo "Memory diagnostics: command 'free' not available on this host."
fi
if command -v df &> /dev/null; then
    df -h / | tail -n 1
else
    echo "Disk space diagnostics: command 'df' not available on this host."
fi
echo ""

# 3. Query Application Services Health Endpoints
echo "--- Microservices Health Verification ---"

# Backend Spring Boot
echo -n "Spring Boot Backend Health [/api/health]: "
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/health)
if [ "$BACKEND_STATUS" -eq 200 ]; then
    echo "🟢 UP (Status 200)"
else
    echo "🔴 DOWN (Status $BACKEND_STATUS)"
fi

# FastAPI AI Service
echo -n "Python AI Telemetry Health [/health]:     "
AI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$AI_STATUS" -eq 200 ]; then
    echo "🟢 UP (Status 200)"
else
    echo "🔴 DOWN (Status $AI_STATUS)"
fi

# Frontend Web Application
echo -n "Nginx Frontend Portal [/:80]:             "
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$FRONTEND_STATUS" -eq 200 ]; then
    echo "🟢 UP (Status 200)"
else
    echo "🔴 DOWN (Status $FRONTEND_STATUS)"
fi

echo ""
echo "======================================================================"
echo "Diagnostics assessment completed."
echo "======================================================================"
