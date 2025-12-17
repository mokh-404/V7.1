#!/bin/bash
# Test script to find which IP the Docker container can use to reach WSL1 host API

echo "Testing which IP allows Docker container to reach WSL1 host API..."
echo ""

# Get WSL1 IPs
WSL_IPS=$(hostname -I)
echo "WSL1 IP addresses: $WSL_IPS"
echo ""

# Test each IP from within the container
for ip in $WSL_IPS; do
    echo "Testing IP: $ip"
    docker-compose exec -T backend curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" --connect-timeout 3 http://$ip:9000/api/health 2>&1 | head -1
    echo ""
done

echo "The IP that returns HTTP 200 is the one to use in docker-compose.yml"

