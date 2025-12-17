# Find the Correct WSL1 IP for Docker

## Quick Test Method

Run this command to test which IP works from the Docker container:

```bash
# Test IP 172.18.48.1 (common Docker bridge IP)
docker-compose exec backend curl -s http://172.18.48.1:9000/api/health

# If that fails, try 192.168.56.1
docker-compose exec backend curl -s http://192.168.56.1:9000/api/health

# Or try the gateway IP
docker-compose exec backend curl -s http://192.168.100.1:9000/api/health
```

**Whichever returns JSON (not connection error) is the correct IP to use.**

## Update docker-compose.yml

Once you find the working IP, edit `docker-compose.yml`:

```yaml
environment:
  - HOST_API_BASE_URL=http://<WORKING_IP>:9000
```

Then restart:
```bash
docker-compose restart backend
```

