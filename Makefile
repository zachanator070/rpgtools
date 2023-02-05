.EXPORT_ALL_VARIABLES:

VERSION=$(shell jq '.version' package.json | sed -e 's/^"//' -e 's/"/$//')
CURRENT_UID=$(shell id -u):$(shell id -g)

##################
# RUN CONTAINERS #
##################

.PHONY: prod
# runs production version of docker image with minimal depending services
prod: build
	docker-compose up -d prod

# runs development docker environment with auto transpiling and restarting services upon file change
.PHONY: dev
dev: .env packages/frontend/dist packages/server/dist db
	docker-compose up server ui-builder

# same as the `dev` target but makes the server wait for a debug connection before it starts the application
.PHONY: dev-brk
dev-brk: .env packages/frontend/dist packages/server/dist db
	docker-compose up server-brk ui-builder

.PHONY: mongodb
mongodb:
	docker-compose up -d mongodb

.PHONY: postgres
postgres:
	docker-compose up -d postgres

.PHONY: down
# stops and destroys any running containers
down: .env
	docker-compose down

.PHONY: dev-logs
# watch logs of running docker containers
dev-logs:
	docker-compose logs -f server ui-builder

.PHONY: restart
# restart any running containers
restart:
	docker-compose restart

.PHONY: build-dev
# rebuilds local docker-compose containers, usually only used in a dev environment
build-dev:
	docker-compose build

#########
# TESTS #
#########

.PHONY: test
test: test-unit test-integration-mongodb test-integration-postgres test-e2e-mongodb test-e2e-postgres

JEST_OPTIONS=

.PHONY: test-unit
test-unit:
	npm run test:unit --workspace=packages/server

test-integration-update-snapshots: JEST_OPTIONS:=-u
test-integration-update-snapshots: test-integration-postgres

.PHONY: test-integration-postgres
test-integration-postgres: postgres
	docker-compose up -d postgres
	cp .env.example packages/server/jest.env
	sed -i 's/^#POSTGRES_HOST=postgres/POSTGRES_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker-compose down

.PHONY: test-integration-mongodb
test-integration-mongodb:
	docker-compose up -d mongodb
	cp .env.example packages/server/jest.env
	sed -i 's/^#MONGODB_HOST=mongodb/MONGODB_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker-compose down

.PHONY: test-integration-sqlite
test-integration-sqlite:
	cp .env.example packages/server/jest.env
	sed -i 's/^#SQLITE_DB_NAME=rpgtools/SQLITE_DB_NAME=rpgtools/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker-compose down

.PHONY: test-e2e-mongodb
test-e2e-mongodb: build
	cp .env.example .env
	sed -i 's/#MONGODB_HOST=.*/MONGODB_HOST=mongodb/' .env
	docker-compose up -d prod mongodb
	./wait_for_server.sh
	> packages/frontend/seed.log
	npm run -w packages/frontend test
	docker-compose down

.PHONY: test-e2e-postgres
test-e2e-postgres: build
	cp .env.example .env
	sed -i 's/#POSTGRES_HOST=.*/POSTGRES_HOST=postgres/' .env
	docker-compose up -d prod postgres
	./wait_for_server.sh
	> packages/frontend/seed.log
	npm run -w packages/frontend test
	docker-compose down

.PHONY: cypress
cypress:
	npm run -w packages/frontend cypress:open

########################
# TEST DATA MANAGEMENT #
########################

dump:.env
	bash dev/scripts/dump.sh

seed-middle-earth: .env
	npm run -w packages/frontend seed:middle_earth

seed-new: .env
	npm run -w packages/frontend seed:new

######
# CI #
######

ci: .env install-deps test

# installs all dependencies for dev and CI work
install-deps:
	npm ci

lint:
	npx eslint packages/server/src packages/common/src --ext .ts
	npx eslint packages/frontend/src --ext .ts

#########################
# CONTINUOUS DEPLOYMENT #
#########################

# runs the js transpiler docker image
ui-prod: .env packages/frontend/dist packages/server/dist
	echo Current UID: ${CURRENT_UID}
	NODE_ENV=production npm -w packages/frontend start

# Builds rpgtools docker image
build: install-deps ui-prod clean-uncompressed
	echo "Building version ${VERSION}"
	docker build -t zachanator070/rpgtools:latest -t zachanator070/rpgtools:${VERSION} -f packages/server/Dockerfile .

# transpiles the server typescript to js
server-js:
	npm run -w packages/server build

cache_node_modules:
	npm ci --omit=dev
	rm -rf node_modules/@rpgtools
	cp -R node_modules node_modules_cache

# makes electron package artifact
electron: cache_node_modules install-deps ui-prod server-js
	rm -rf node_modules/@rpgtools
	cp -R node_modules_cache/* packages/server/node_modules
	mkdir packages/server/node_modules/@rpgtools
	cp -R packages/common packages/server/node_modules/@rpgtools
	npm run -w packages/server make

# cleans built transpiled js and node modules
clean: down clean-deps
	rm -rf db
	rm -rf packages/frontend/dist
	rm -rf packages/server/dist
	rm -rf packages/server/out
	-docker rmi zachanator070/rpgtools:latest

clean-deps:
	rm -rf node_modules
	rm -rf packages/frontend/node_modules
	rm -rf packages/server/node_modules
	rm -rf packages/common/node_modules
	-rm -rf node_modules_cache

# cleans up uncompressed artifacts that bloat the built docker image
clean-uncompressed:
	rm -f packages/frontend/dist/app.bundle.js
	rm -f packages/frontend/dist/app.css

# builds transpiled js bundles with stats about bundle, stats end up in dist folder
build-with-stats: BUILD_WITH_STATS=true
	export BUILD_WITH_STATS
build-with-stats: ui-prod

packages/frontend/dist:
	mkdir -p packages/frontend/dist
	chmod -R o+rw packages/frontend/dist

packages/server/dist:
	mkdir -p packages/server/dist

db:
	mkdir -p db

# initializes environment file
.env:
	cp .env.example .env

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
	sed -i 's/#MONGODB_HOST=.*/MONGODB_HOST=localhost/' .env
	sudo cp rpgtools.service /lib/systemd/system
	sudo systemctl daemon-reload
	sudo systemctl start rpgtools
	sudo systemctl enable rpgtools
	echo rpgtools is now available
