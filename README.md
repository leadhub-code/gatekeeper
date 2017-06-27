static-gate: Login gate for static files
========================================

This is a simple web app that lets unauthorized users sign in with Google and then,
if the user is successfilly authenticated and is authorized, serves static files
from configurad directory on disk.

Use case: serving and protecting private project documentation

Docker
------

Build Docker image: `docker build -t gatekeeper .`

Run Docker container: `docker run --rm -p 8000:3000 -v /some/path:/conf -e GATEKEEPER_CONF=/conf/production.yaml gatekeeper`
