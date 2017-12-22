docker_image=gatekeeper

dev:
	test -d node_modules || yarn install
	yarn run dev

run:
	test -d node_modules || yarn install
	yarn run build
	yarn run start

docker-build:
	docker build -t $(docker_image) .
