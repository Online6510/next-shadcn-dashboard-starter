# Deployment

Wanderly V2 runs as a single-user Node.js application with a writable persistent volume. Use Node 22.13+ and run the production build and server from the README. For a private demonstration bind the server to the loopback interface. Set `WANDERLY_DATA_DIR` to a directory writable by the application user and back up the whole directory, including uploads.

Ephemeral Vercel function storage cannot retain this SQLite database and its uploaded photos across instances. A public multi-user deployment requires authentication, tenant-scoped reads and writes, a durable database and private object storage. See [architecture and restore procedure](ARCHITECTURE.md).

## Docker

The repository includes two Dockerfiles: `Dockerfile` (Node.js) and `Dockerfile.bun` (Bun). Pass `NEXT_PUBLIC_*` variables as `--build-arg` at build time and runtime secrets via `-e` at run time.

Build the image:

```bash
# Node.js
docker build \
  -t wanderly .

# OR Bun
docker build -f Dockerfile.bun \
  -t wanderly .
```

Run the container:

```bash
docker run -d -p 127.0.0.1:3000:3000 -v wanderly-data:/app/.wanderly \
  --restart unless-stopped \
  --name wanderly \
  wanderly
```
