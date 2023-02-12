.EXPORT_ALL_VARIABLES:

VERSION=$(shell jq '.version' package.json | sed -e 's/^"//' -e 's/"/$//')
CURRENT_UID=$(shell id -u):$(shell id -g)

NODE_MODULES=node_modules/@rpgtools/server/package.json
FRONTEND_JS=packages/frontend/dist/app.js
FRONTEND_TS=$(shell find packages/frontend/src -name *.ts)
SERVER_JS=packages/server/dist/server/src/index.js
SERVER_TS=$(shell find packages/server/src -name *.ts)

##################
# RUN CONTAINERS #
##################

# runs production version of docker image with minimal depending services
run-prod: build-prod
	docker compose up -d prod

# runs development docker environment with auto transpiling and restarting services upon file change
run-dev: .env packages/frontend/dist packages/server/dist/common packages/server/dist/server db
	docker compose up server ui-builder

# same as the `dev` target but makes the server wait for a debug connection before it starts the application
run-dev-brk: .env packages/frontend/dist packages/server/dist/common packages/server/dist/server db
	docker compose up server-brk ui-builder

run-mongodb:
	docker compose up -d mongodb

run-postgres:
	docker compose up -d postgres

# stops and destroys any running containers
down: .env
	docker compose down

# restart any running containers
restart:
	docker compose restart

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

#########
# TESTS #
#########

test: test-unit test-integration test-e2e

JEST_OPTIONS=

test-unit:
	npm run test:unit --workspace=packages/server

test-integration: test-integration-mongodb test-integration-postgres

test-integration-update-snapshots: JEST_OPTIONS:=-u
test-integration-update-snapshots: test-integration-postgres

test-integration-postgres:
	docker compose up -d postgres
	cp .env.example packages/server/jest.env
	sed -i 's/^#POSTGRES_HOST=postgres/POSTGRES_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker compose down

test-integration-mongodb:
	docker compose up -d mongodb
	cp .env.example packages/server/jest.env
	sed -i 's/^#MONGODB_HOST=mongodb/MONGODB_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker compose down

test-integration-sqlite:
	cp .env.example packages/server/jest.env
	sed -i 's/^#SQLITE_DB_NAME=rpgtools/SQLITE_DB_NAME=rpgtools/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker compose down

test-e2e: test-e2e-mongodb test-e2e-postgres

test-e2e-mongodb: build-prod
	cp .env.example .env
	sed -i 's/#MONGODB_HOST=.*/MONGODB_HOST=mongodb/' .env
	docker compose up -d prod mongodb
	./wait_for_server.sh
	> packages/frontend/seed.log
	npm run -w packages/frontend test
	docker compose down

test-e2e-postgres: build-prod
	cp .env.example .env
	sed -i 's/#POSTGRES_HOST=.*/POSTGRES_HOST=postgres/' .env
	docker compose up -d prod postgres
	./wait_for_server.sh
	> packages/frontend/seed.log
	npm run -w packages/frontend test
	docker compose down

run-cypress:
	npm run -w packages/frontend cypress:open

########################
# TEST DATA MANAGEMENT #
########################

dump-db:.env
	bash dev/scripts/dump.sh

seed-middle-earth: .env
	npm run -w packages/frontend seed:middle_earth

seed-new: .env
	npm run -w packages/frontend seed:new

######
# CI #
######

ci: .env $(NODE_MODULES) test

lint:
	npx eslint packages/server/src packages/common/src --ext .ts
	npx eslint packages/frontend/src --ext .ts

#########################
# CONTINUOUS DEPLOYMENT #
#########################

# Builds rpgtools docker image
build-prod: $(NODE_MODULES) prod-ui clean-uncompressed $(SERVER_JS)
	echo "Building version $(VERSION)"
	docker build -t zachanator070/rpgtools:latest -t zachanator070/rpgtools:$(VERSION) -f packages/server/Dockerfile .

node_modules_cache:
	npm ci --omit=dev
	rm -rf node_modules/@rpgtools
	mv node_modules node_modules_cache

# makes electron package artifact
electron: node_modules_cache $(NODE_MODULES) prod-ui $(SERVER_JS)
	rm -rf node_modules/@rpgtools
	cp -R node_modules_cache/* packages/server/node_modules
	mkdir packages/server/node_modules/@rpgtools
	cp -R packages/common packages/server/node_modules/@rpgtools
	mkdir packages/server/dist/frontend
	cp -R packages/frontend/dist/* packages/server/dist/frontend
	npm run -w packages/server make

# cleans up uncompressed artifacts that bloat the built docker image
clean-uncompressed:
	rm -f packages/frontend/dist/app.js
	rm -f packages/frontend/dist/app.css

# builds transpiled js bundles with stats about bundle, stats end up in dist folder
build-with-stats: BUILD_WITH_STATS=true
build-with-stats: NODE_ENV=production
build-with-stats: $(FRONTEND_JS)

# pushes built docker container to dockerhub
publish:
	docker login -u="$(DOCKER_USERNAME)" -p="$(DOCKER_PASSWORD)"
	docker push zachanator070/rpgtools:$(VERSION)
	docker push zachanator070/rpgtools:latest

#########
# BUILD #
#########

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

dev-deps: $(NODE_MODULES)

prod-deps: NODE_ENV=production
prod-deps: $(NODE_MODULES)

$(NODE_MODULES): package-lock.json
	npm ci

server-js: $(SERVER_JS)

# transpiles the server typescript to js
$(SERVER_JS): $(SERVER_TS) $(NODE_MODULES)
	npm run -w packages/server build

prod-ui: NODE_ENV=production
prod-ui: $(FRONTEND_JS)

# transpiles the frontend tsx and typescript to js
$(FRONTEND_JS): $(FRONTEND_TS) $(NODE_MODULES) .env
	npm -w packages/frontend start

packages/frontend/dist:
	mkdir -p packages/frontend/dist
	chmod -R o+rw packages/frontend/dist

packages/server/dist/common:
	mkdir -p packages/server/dist/common

packages/server/dist/server:
	mkdir -p packages/server/dist/server

db:
	mkdir -p db

.env:
	cp .env.example .env

# builds local docker compose containers, usually only used in a dev environment
build-dev: $(FRONTEND_JS)
	docker compose build