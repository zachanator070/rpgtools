.EXPORT_ALL_VARIABLES:

VERSION=$(shell jq '.version' package.json | sed -e 's/^"//' -e 's/"/$//')
CURRENT_UID=$(shell id -u):$(shell id -g)

NODE_MODULES=node_modules/.package-lock.json

SERVER_BUILD_DEST=packages/server/dist/server
FRONTEND_BUILD_DEST=packages/server/dist/frontend

PROD_FRONTEND_JS=packages/server/dist/frontend/production.txt
DEV_FRONTEND_JS=packages/server/dist/frontend/development.txt
FRONTEND_TS=$(wildcard packages/frontend/src/**/*.ts packages/frontend/src/*.ts)

SERVER_JS=$(SERVER_BUILD_DEST)/src/index.js
SERVER_TS=$(wildcard packages/server/src/**/*.ts packages/server/src/**/*.js packages/server/src/**/*.cjs packages/server/src/**/*.html packages/server/src/*.ts packages/server/src/*.js packages/server/src/*.cjs packages/server/src/*.html)

ELECTRON_APP=$(shell ./dev/scripts/electron-app-location.sh)
ELECTRON_DEB=out/make/deb/x64/rpgtools-server_$(VERSION)_amd64.deb

DEV_SERVER_CONTAINER=containers/dev-server.txt
DEV_SERVER_CONTAINER_SRC=./Dockerfile packages/server/tsconfig.json package-lock.json
DEV_SERVER_BRK_CONTAINER=containers/dev-server-brk.txt
DEV_FRONTEND_CONTAINER=containers/dev-ui.txt
PROD_SERVER_CONTAINER=containers/prod-server.txt

FRONTEND_PACKAGE_JSON=packages/frontend/package.json

DOCKER_EXEC=docker compose run --rm dev

# Cypress cache folder to avoid OS specific paths
export CYPRESS_CACHE_FOLDER := $(CURDIR)/.cache/Cypress
CYPRESS_BINARY=$(shell ./dev/scripts/cypress-binary-location.sh)

################
# RUN COMMANDS #
################
.PHONY: run-prod run-dev run-dev-brk run-postgres down restart install run-electron

# runs production version of docker image with minimal depending services
run-prod: .env $(PROD_SERVER_CONTAINER)
	docker compose up -d prod

# runs development docker environment with auto transpiling and restarting services upon file change
run-dev: .env $(SERVER_BUILD_DEST) db containers $(DEV_SERVER_CONTAINER) $(DEV_FRONTEND_CONTAINER)
	docker compose up server ui-builder

# same as the `dev` target but makes the server wait for a debug connection before it starts the application
run-dev-brk: .env  $(SERVER_BUILD_DEST) db
	docker compose up server-brk ui-builder

run-postgres: .env
	docker compose up -d postgres

shell: .env
	$(DOCKER_EXEC) bash

# stops and destroys any running containers
down: .env
	docker compose down

# restart any running containers
restart: .env
	docker compose restart

# performs minimal install on a debian host
install:
	sudo apt install postgresql
	sudo systemctl enable postgresql
	sudo mkdir /etc/rpgtools
	sudo cp .env.example /etc/rpgtools/.env
	$(DOCKER_EXEC) sed -i 's/#POSTGRES_HOST=.*/POSTGRES_HOST=localhost/' .env
	sudo cp rpgtools.service /lib/systemd/system
	sudo systemctl daemon-reload
	sudo systemctl start rpgtools
	sudo systemctl enable rpgtools
	echo rpgtools is now available

run-electron: .env $(ELECTRON_APP)
	./dev/scripts/run-electron-app.sh

#########
# TESTS #
#########

TEST_ENV_FILE=packages/server/test.env

.PHONY: test test-unit test-integration test-integration-update-snapshots test-integration-postgres test-integration-sqlite
.PHONY: test-e2e test-e2e-postgres test-e2e-sqlite run-cypress

test: test-unit test-integration test-e2e

VITEST_OPTIONS?=

test-unit:
	npm run test:unit --workspace=packages/server

test-integration: test-integration-postgres

test-integration-update-snapshots: VITEST_OPTIONS:=-u
test-integration-update-snapshots: test-integration-postgres

test-integration-postgres: .env
	docker compose up -d postgres
	cp .env.example $(TEST_ENV_FILE)
	$(DOCKER_EXEC) sed -i 's/^#POSTGRES_HOST=postgres/POSTGRES_HOST=localhost/' $(TEST_ENV_FILE)
	npm run test:integration --workspace=packages/server $(VITEST_OPTIONS)
	docker compose down

test-integration-sqlite: .env
	cp .env.example $(TEST_ENV_FILE)
	$(DOCKER_EXEC) sed -i 's/^#SQLITE_DIRECTORY_PATH=.*/SQLITE_DIRECTORY_PATH=db/' $(TEST_ENV_FILE)
	npm run test:integration --workspace=packages/server
	docker compose down

test-e2e: test-e2e-postgres test-e2e-sqlite

# Cypress binary needs to be installed at the OS level to work
$(CYPRESS_BINARY):
	npx cypress install --force

test-e2e-postgres: .env $(PROD_SERVER_CONTAINER) $(CYPRESS_BINARY)
	cp .env.example .env
	$(DOCKER_EXEC) sed -i 's/#POSTGRES_HOST=.*/POSTGRES_HOST=postgres/' .env
	docker compose up -d prod postgres
	./dev/scripts/wait_for_server.sh
	> packages/frontend/seed.log
	npm run -w packages/frontend test
	docker compose down

test-e2e-sqlite: $(ELECTRON_APP) $(CYPRESS_BINARY)
	./dev/scripts/set-sqlite-env.sh
	./dev/scripts/run-electron-app.sh
	./dev/scripts/wait_for_server.sh
	npm run -w packages/frontend test

run-cypress: $(NODE_MODULES) $(CYPRESS_BINARY)
	npm run -w packages/frontend cypress:open

########################
# TEST DATA MANAGEMENT #
########################
.PHONY: dump-db seed-middle-earth seed-new

dump-db: .env
	bash dev/scripts/dump.sh

seed-middle-earth: .env
	npm run -w packages/frontend seed:middle_earth

seed-new: .env
	npm run -w packages/frontend seed:new

######
# CI #
######
.PHONY: ci lint ci-unit ci-integration ci-e2e-postgres ci-e2e-sqlite

# runs all tests for continuous integration environment
ci: .env $(NODE_MODULES) test

ci-unit: .env $(NODE_MODULES) test-unit

ci-integration: .env $(NODE_MODULES) test-integration

ci-e2e-postgres: .env $(NODE_MODULES) test-e2e-postgres

ci-e2e-sqlite: .env $(NODE_MODULES) test-e2e-sqlite

lint:
	npx eslint packages/server/src packages/common/src --ext .ts
	npx eslint packages/frontend/src --ext .ts

#########################
# CONTINUOUS DEPLOYMENT #
#########################
.PHONY: publish

# pushes built docker container to dockerhub
publish:
	docker login -u="$(DOCKER_USERNAME)" -p="$(DOCKER_PASSWORD)"
	docker push zachanator070/rpgtools:$(VERSION)
	docker push zachanator070/rpgtools:latest

###############
# BUILD CLEAN #
###############
.PHONY: clean clean-deps clean-docker

# cleans built transpiled js and node modules
clean: clean-deps clean-docker clean-electron
	rm -rf db
	rm -rf packages/server/dist

clean-deps:
	rm -rf node_modules
	rm -rf .npm
	rm -rf packages/frontend/node_modules
	rm -rf packages/server/node_modules
	rm -rf packages/common/node_modules
	-rm -rf node_modules_prod
	-rm -rf node_modules_dev
	-rm -rf .cache

clean-docker: down
	-docker ps -a | grep rpgtools | awk '{print $$1}' | xargs docker rm -f
	-docker images -a | grep rpgtools | awk '{print $$3}' | xargs docker rmi -f
	-docker rmi zachanator070/rpgtools:latest
	-rm -rf containers

clean-electron:
	-rm -rf out

######################
# BUILD DEPENDENCIES #
######################
.PHONY: dev-deps prod-deps

dev-deps: $(NODE_MODULES)

prod-deps: NODE_ENV=production
prod-deps: $(NODE_MODULES)

$(NODE_MODULES): package-lock.json
	$(DOCKER_EXEC) npm ci

################
# BUILD SERVER #
################
.PHONY: server-js build-prod

server-js: $(SERVER_JS)

# transpiles the server typescript to js
$(SERVER_JS): $(NODE_MODULES) $(SERVER_TS)
	npm run -w packages/server build

build-prod: $(PROD_SERVER_CONTAINER)

# Builds rpgtools docker image
$(PROD_SERVER_CONTAINER): containers $(PROD_FRONTEND_JS) $(SERVER_JS)
	echo "Building version $(VERSION)"
	docker build -t zachanator070/rpgtools:latest -t zachanator070/rpgtools:$(VERSION) -f ./Dockerfile --build-arg NODE_ENV=production .
	echo $(shell docker images | grep zachanator070/rpgtools:latest | awk '{print $3}' > $(PROD_SERVER_CONTAINER) )

############
# BUILD UI #
############
.PHONY: prod-ui build-with-stats

# transpiles the frontend tsx and typescript to js
prod-ui: $(PROD_FRONTEND_JS)

$(PROD_FRONTEND_JS): $(NODE_MODULES) $(FRONTEND_TS)
	NODE_ENV=production npm run --workspace=packages/frontend start
	> $(PROD_FRONTEND_JS)

$(DEV_FRONTEND_JS): $(FRONTEND_TS) $(NODE_MODULES)
	docker compose run --rm ui-builder npm run --workspace=packages/frontend start
	> $(DEV_FRONTEND_JS)

# builds transpiled js bundles with stats about bundle, stats end up in dist folder
build-with-stats: BUILD_WITH_STATS=true
build-with-stats: $(PROD_FRONTEND_JS)

#####################
# BUILD DIRECTORIES #
#####################
.PHONY: build-dev build-common

$(SERVER_BUILD_DEST):
	mkdir -p $(SERVER_BUILD_DEST)

db:
	mkdir -p db

.env:
	cp .env.example .env

containers:
	mkdir -p containers

# builds local docker compose containers, usually only used in a dev environment
build-dev: .env
	docker compose build

$(DEV_SERVER_CONTAINER): .env containers $(NODE_MODULES) $(DEV_SERVER_CONTAINER_SRC)
	docker compose build server
	echo $(shell docker images | grep rpgtools-server | awk '{print $3}' > $(DEV_SERVER_CONTAINER) )

$(DEV_SERVER_BRK_CONTAINER): .env containers $(NODE_MODULES) $(DEV_SERVER_CONTAINER_SRC)
	docker compose build server-brk
	echo $(shell docker images | grep rpgtools-server-brk | awk '{print $3}' > $(DEV_SERVER_BRK_CONTAINER) )

$(DEV_FRONTEND_CONTAINER): .env containers $(NODE_MODULES) $(FRONTEND_PACKAGE_JSON) Dockerfile
	docker compose build ui-builder
	echo $(shell docker images | grep rpgtools-ui-builder | awk '{print $3}' > $(DEV_FRONTEND_CONTAINER) )

build-common:
	npm run -w packages/common build

##################
# BUILD ELECTRON #
##################
.PHONY: electron-prep electron-package electron-make electron

ELECTRON_PACKAGE_JSON=package.json
SERVER_PACKAGE_JSON=packages/server/package.json

$(ELECTRON_PACKAGE_JSON): $(SERVER_PACKAGE_JSON)
	# copy server dependencies to electron package.json, electron uses npm to prune unused packages so we cannot use forge hooks for this
	jq -s '.[0] as $$src | .[1] as $$dest | $$dest | .dependencies = (( $$dest.dependencies // {} ) + ( $$src.dependencies // {} ))' packages/server/package.json package.json > target.tmp && mv target.tmp package.json
	npm i

ELECTRON_DEPS=$(PROD_FRONTEND_JS) $(SERVER_JS) $(ELECTRON_PACKAGE_JSON)

# creates executable
electron-package: .env $(ELECTRON_APP)

$(ELECTRON_APP): $(ELECTRON_DEPS)
	npm run electron:package
ifeq ($(origin GITHUB_ACTIONS),environment)
	sudo chown root:root ./out/rpgtools-linux-x64/chrome-sandbox
	sudo chmod 4755 ./out/rpgtools-linux-x64/chrome-sandbox
endif

# creates installable package
electron-make: .env $(ELECTRON_DEPS)
	npm run electron:make
