docker_image=gatekeeper
npm=npm

dev:
	test -d node_modules || $(npm) install
	$(npm) run dev

run:
	test -d node_modules || $(npm) install
	$(npm) run build
	$(npm) run start

docker-build:
	docker build -t $(docker_image) .

docker-run:
	docker run --rm -it -p 3000:3000 $(docker_run_args) $(docker_image)
