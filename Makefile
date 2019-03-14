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
