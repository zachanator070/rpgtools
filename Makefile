VERSION=$(shell jq '.version' package.json | sed -e 's/^"//' -e 's/"/$//')
CURRENT_UID=$(id -u):$(id -g)
export CURRENT_UID

# Builds rpgtools docker image
build: prod-frontend-builder clean-uncompressed
	echo "Building version ${VERSION}"
	docker build -t rpgtools:latest -t rpgtools:${VERSION} -f packages/server/Dockerfile .

# cleans built transpiled js and node modules
clean: down
	rm -rf node_modules
	rm -rf packages/frontend/dist
	rm -rf packages/frontend/node_modules
	rm -rf packages/server/node_modules
	rm -rf packages/common/node_modules
	docker rmi rpgtools_server
	docker rmi rpgtools_frontend-builder

# cleans up uncompressed artifacts that bloat the built docker image
clean-uncompressed:
	rm -f dist/app.bundle.js
	rm -f dist/app.css

# runs the js transpiler docker image
prod-frontend-builder: clean init-env
	mkdir -p dist
	docker-compose build frontend-builder
	docker-compose run frontend-builder npm run -w packages/frontend start

# builds transpiled js bundles with stats about bundle, stats end up in dist folder
build-with-stats: BUILD_WITH_STATS=true
	export BUILD_WITH_STATS
build-with-stats: prod-frontend-builder

# runs production version of docker image with minimal depending services
prod: .env
	docker-compose up --build prod

# runs development docker environment with auto transpiling and restarting services upon file change
dev: .env
	mkdir -p packages/frontend/dist
	docker-compose up server frontend-builder

# initializes environment file
.env:
	cp .env.example .env

build-dev:
	docker-compose build

# stops and destroys any running containers
down: .env
	docker-compose down

# watch logs of running docker containers
dev-logs:
	docker-compose logs -f server frontend-builder

# restart any running containers
restart:
	docker-compose restart

# pushes built docker container to dockerhub
publish: build
	docker login -u="${DOCKER_USERNAME}" -p="${DOCKER_PASSWORD}"
	docker tag rpgtools:${VERSION} ${DOCKER_USERNAME}/rpgtools:${VERSION}
	docker tag rpgtools:latest ${DOCKER_USERNAME}/rpgtools:latest
	docker push ${DOCKER_USERNAME}/rpgtools:latest
	docker push ${DOCKER_USERNAME}/rpgtools:${VERSION}

# performs minimal install on a debian host
install:
	sudo apt install mongodb
	sudo systemctl enable mongodb
	sudo mkdir /etc/rpgtools
	sudo cp .env.example /etc/rpgtools/.env
	sudo cp rpgtools.service /lib/systemd/system
	sudo systemctl daemon-reload
	sudo systemctl start rpgtools
	sudo systemctl enable rpgtools
	echo rpgtools is now available

ci: install-deps test

# installs all dependencies for dev and CI work
install-deps:
	# installs node modules needed by CI
	npm install

lint:
	npx eslint packages/server/src packages/common/src --ext .ts
	npx eslint packages/frontend/src --ext .ts

test: down test-unit test-integration

JEST_OPTIONS=

test-unit:
	npm run test:unit --workspace=packages/server

test-integration-update-snapshots: JEST_OPTIONS:=-u
test-integration-update-snapshots: test-integration

test-integration:
	- docker-compose up -d mongodb
	npm run test:integration --workspace=packages/server
	- docker-compose down

test-e2e:
	- docker-compose up -d mongodb server
	./wait_for_server.sh
	npm run -w packages/frontend test
	- docker-compose down

dump:
	sudo rm -rf ./dev/mongodb-init/dump.archive
	docker-compose exec mongodb mongodump --archive=/docker-entrypoint-initdb.d/dump.archive -d rpgtools
	sudo chown ${USER}:${USER} ./dev/mongodb-init/dump.archive

seed:
	npm run -w packages/frontend seed:middle_earth

cypress:
	npm run -w packages/frontend cypress:open

db:
	docker-compose up -d mongodb