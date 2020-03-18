VERSION=`git describe --abbrev=0 --tags`
CURRENT_UID=$(id -u):$(id -g)
export CURRENT_UID

# Builds rpgtools docker image
build: prod-builder clean-uncompressed
	echo "Building version ${VERSION}"
	docker build -t rpgtools:latest -t rpgtools:${VERSION} -f src/server/Dockerfile .

# cleans built transpiled js and node modules
clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf app/node_modules
	rm -rf server/node_modules

# cleans up uncompressed artifacts that bloat the built docker image
clean-uncompressed:
	rm -f dist/app.bundle.js
	rm -f dist/app.css

# runs the js transpiler docker image
prod-builder: clean init-env
	mkdir -p dist
	docker-compose up --build prod-builder

# builds transpiled js bundles with stats about bundle, stats end up in dist folder
build-with-stats: BUILD_WITH_STATS=true
	export BUILD_WITH_STATS
build-with-stats: prod-builder

# runs production version of docker image with minimal depending services
prod: build
	docker-compose up --build prod-server

# runs development docker environment with auto transpiling and restarting services upon file change
dev: init-env dev-up logs

# intializes environment file
init-env:
	touch .env

# runs developement docker images
dev-up:
	mkdir -p dist
	docker-compose up --build -d dev-server

# stops and destroys any running containers
down:
	docker-compose down

# watch logs of running docker containers
logs:
	docker-compose logs -f

# restart any running containers
restart:
	docker-compose restart

# pushes built docker container to dockerhub
publish:
	docker login -u="${DOCKER_USERNAME}" -p="${DOCKER_PASSWORD}"
	docker tag rpgtools:${VERSION} ${DOCKER_USERNAME}/rpgtools:${VERSION}
	docker tag rpgtools:latest ${DOCKER_USERNAME}/rpgtools:latest
	docker push ${DOCKER_USERNAME}/rpgtools:latest
	docker push ${DOCKER_USERNAME}/rpgtools:${VERSION}

# performs minimal isntall on a debian host
install:
	sudo apt update
	sudo apt install mongodb
	sudo mkdir /etc/rpgtools
	sudo cp .env.example /etc/rpgtools/.env
	sudo cp rpgtools.service /lib/systemd/system
	sudo systemd daemon-reload
	sudo systemd start rpgtools
	echo rpgtools is now available

# installs development dependencies to allow ide autocomplete
install-deps:
	cd server && npm install
	cd app && npm install

test-integration:
	- docker-compose up -d mongodb
	export JEST_SETUP_FILES=./tests/integration/setup.js && cd server && npm run test-integration