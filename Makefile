.EXPORT_ALL_VARIABLES:

VERSION=$(shell jq '.version' package.json | sed -e 's/^"//' -e 's/"/$//')
CURRENT_UID=$(shell id -u):$(shell id -g)

# Builds rpgtools docker image
build: install-deps ui-prod clean-uncompressed
	echo "Building version ${VERSION}"
	docker build -t zachanator070/rpgtools:latest -t zachanator070/rpgtools:${VERSION} -f packages/server/Dockerfile .

# cleans built transpiled js and node modules
clean: down
	rm -rf packages/frontend/dist
	rm -rf packages/server/dist
	-docker rmi zachanator070/rpgtools:latest

clean-deps:
	rm -rf node_modules
	rm -rf packages/frontend/node_modules
	rm -rf packages/server/node_modules
	rm -rf packages/common/node_modules

# cleans up uncompressed artifacts that bloat the built docker image
clean-uncompressed:
	rm -f packages/frontend/dist/app.bundle.js
	rm -f packages/frontend/dist/app.css

# runs the js transpiler docker image
ui-prod: .env packages/frontend/dist packages/server/dist
	echo Current UID: ${CURRENT_UID}
	NODE_ENV=production npm -w packages/frontend start

# builds transpiled js bundles with stats about bundle, stats end up in dist folder
build-with-stats: BUILD_WITH_STATS=true
	export BUILD_WITH_STATS
build-with-stats: ui-prod

# runs production version of docker image with minimal depending services
prod: build
	docker-compose up -d prod

# runs development docker environment with auto transpiling and restarting services upon file change
.PHONY: dev
dev: .env packages/frontend/dist packages/server/dist
	docker-compose up server ui-builder

# same as the dev target but makes the server wait for a debug connection before it starts the application
.PHONY: dev-brk
dev-brk: .env packages/frontend/dist packages/server/dist
	docker-compose up server-brk ui-builder

packages/frontend/dist:
	mkdir -p packages/frontend/dist
	chmod o+rw -R packages/frontend/dist

packages/server/dist:
	mkdir -p packages/server/dist

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
	docker-compose logs -f server ui-builder

# restart any running containers
restart:
	docker-compose restart

# pushes built docker container to dockerhub
publish:
	docker login -u="${DOCKER_USERNAME}" -p="${DOCKER_PASSWORD}"
	docker push zachanator070/rpgtools:${VERSION}
	docker push zachanator070/rpgtools:latest

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

ci: .env install-deps test

# installs all dependencies for dev and CI work
install-deps:
	# installs node modules needed by CI
	npm install

lint:
	npx eslint packages/server/src packages/common/src --ext .ts
	npx eslint packages/frontend/src --ext .ts

test: test-unit test-integration-postgres prod test-e2e down

JEST_OPTIONS=

test-unit:
	npm run test:unit --workspace=packages/server

.PHONY: jest.env
jest.env:
	cp .env.example packages/server/jest.env

test-integration-update-snapshots: JEST_OPTIONS:=-u
test-integration-update-snapshots: test-integration-postgres

.PHONY: test-integration-postgres
test-integration-postgres: POSTGRES_HOST:=localhost
test-integration-postgres: jest.env postgres
	sed -i 's/#POSTGRES_HOST=postgres/POSTGRES_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server

postgres:
	docker-compose up -d postgres

.PHONY: test-integration-mongodb
test-integration-mongodb: MONGODB_HOST:=localhost
test-integration-mongodb: jest.env mongodb
	sed -i 's/#MONGODB_HOST=mongodb/MONGODB_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server

test-e2e:
	./wait_for_server.sh
	> packages/frontend/seed.log
	npm run -w packages/frontend test

dump:
	sudo rm -rf ./dev/mongodb-scripts/dump.archive
	docker-compose exec mongodb mongodump --archive=/mongodb-scripts/dump.archive -d rpgtools
	sudo chown ${USER}:${USER} ./dev/mongodb-scripts/dump.archive

seed:
	npm run -w packages/frontend seed:middle_earth

seed-new:
	npm run -w packages/frontend seed:new

cypress:
	npm run -w packages/frontend cypress:open

mongodb:
	docker-compose up -d mongodb