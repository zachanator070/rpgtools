.EXPORT_ALL_VARIABLES:

VERSION=$(shell jq '.version' package.json | sed -e 's/^"//' -e 's/"/$//')
CURRENT_UID=$(shell id -u):$(shell id -g)

NODE_MODULES=node_modules/.package-lock.json
PROD_NODE_MODULES_CACHE=node_modules_prod/apollo-server/package.json
DEV_NODE_MODULES_CACHE=node_modules_dev/apollo-server/package.json

SERVER_BUILD_DEST=packages/server/dist/server
FRONTEND_BUILD_DEST=packages/server/dist/frontend

PROD_FRONTEND_JS=packages/server/dist/frontend/production.txt
DEV_FRONTEND_JS=packages/server/dist/frontend/development.txt
FRONTEND_TS=$(shell find packages/frontend/src -name *.ts)

SERVER_JS=$(SERVER_BUILD_DEST)/src/index.js
SERVER_TS=$(shell find packages/server/src -name '*.ts' -o -name '*.js' -o -name '*.cjs' -o -name '*.html')

ELECTRON_EXEC=packages/server/out/@rpgtools-server-linux-x64/@rpgtools-server
ELECTRON_DEB=packages/server/out/make/deb/x64/rpgtools-server_$(VERSION)_amd64.deb

DEV_SERVER_CONTAINER=containers/dev-server.txt
DEV_SERVER_CONTAINER_SRC=packages/server/Dockerfile packages/server/tsconfig.json package-lock.json
DEV_SERVER_BRK_CONTAINER=containers/dev-server-brk.txt
DEV_FRONTEND_CONTAINER=containers/dev-ui.txt
PROD_SERVER_CONTAINER=containers/prod-server.txt

FRONTEND_PACKAGE_JSON=packages/frontend/package.json

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
	docker compose run --rm dev bash

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
	sed -i 's/#POSTGRES_HOST=.*/POSTGRES_HOST=localhost/' .env
	sudo cp rpgtools.service /lib/systemd/system
	sudo systemctl daemon-reload
	sudo systemctl start rpgtools
	sudo systemctl enable rpgtools
	echo rpgtools is now available

run-electron: $(ELECTRON_EXEC)
	export SQLITE_DIRECTORY_PATH=db && ./$(ELECTRON_EXEC)

#########
# TESTS #
#########
.PHONY: test test-unit test-integration test-integration-update-snapshots test-integration-postgres test-integration-sqlite
.PHONY: test-e2e test-e2e-postgres test-e2e-sqlite run-cypress

test: test-unit test-integration test-e2e

JEST_OPTIONS=

test-unit:
	npm run test:unit --workspace=packages/server

test-integration: test-integration-postgres

test-integration-update-snapshots: JEST_OPTIONS:=-u
test-integration-update-snapshots: test-integration-postgres

test-integration-postgres: .env
	docker compose up -d postgres
	cp .env.example packages/server/jest.env
	sed -i 's/^#POSTGRES_HOST=postgres/POSTGRES_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker compose down

test-integration-sqlite: .env
	cp .env.example packages/server/jest.env
	sed -i 's/^#SQLITE_DIRECTORY_PATH=.*/SQLITE_DIRECTORY_PATH=db/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker compose down

test-e2e: test-e2e-postgres test-e2e-sqlite

test-e2e-postgres: .env $(PROD_SERVER_CONTAINER)
	cp .env.example .env
	sed -i 's/#POSTGRES_HOST=.*/POSTGRES_HOST=postgres/' .env
	docker compose up -d prod postgres
	./wait_for_server.sh
	> packages/frontend/seed.log
	npm run -w packages/frontend test
	docker compose down

test-e2e-sqlite: $(ELECTRON_EXEC)
	cp .env.example .env
	sed -i 's/^#SQLITE_DIRECTORY_PATH=.*/SQLITE_DIRECTORY_PATH=db/' .env
	-rm ./db/rpgtools.sqlite
	export SQLITE_DIRECTORY_PATH=db && nohup ./$(ELECTRON_EXEC) >electron.log 2>&1 &
	./wait_for_server.sh
	npm run -w packages/frontend test
	pkill -f @rpgtools

run-cypress:
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
.PHONY: ci lint

ci: .env $(NODE_MODULES) test

lint:
	npx eslint --ignore-pattern */node_modules --ignore-pattern dist packages/**

lint-fix:
	npx eslint --ignore-pattern */node_modules --ignore-pattern dist packages/** --fix

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
clean: clean-deps clean-docker
	rm -rf db
	rm -rf packages/server/dist
	rm -rf packages/server/out

clean-deps:
	rm -rf node_modules
	rm -rf .npm
	rm -rf packages/frontend/node_modules
	rm -rf packages/server/node_modules
	rm -rf packages/common/node_modules
	-rm -rf node_modules_prod
	-rm -rf node_modules_dev
	-rm -rf .ccache

clean-docker: down
	-docker ps -a | grep rpgtools | awk '{print $$1}' | xargs docker rm -f
	-docker images -a | grep rpgtools | awk '{print $$3}' | xargs docker rmi -f
	-docker rmi zachanator070/rpgtools:latest
	-rm -rf containers

######################
# BUILD DEPENDENCIES #
######################
.PHONY: dev-deps prod-deps

dev-deps: $(NODE_MODULES)

prod-deps: NODE_ENV=production
prod-deps: $(NODE_MODULES)

$(NODE_MODULES): .env package-lock.json
	npm ci

$(PROD_NODE_MODULES_CACHE): .env
	npm ci --omit=dev
	mkdir -p node_modules_prod
	cp -R node_modules/* node_modules_prod
	rm -rf node_modules_prod/@rpgtools

$(DEV_NODE_MODULES_CACHE): .env
	npm ci
	mkdir -p node_modules_dev
	cp -R node_modules/* node_modules_dev

################
# BUILD SERVER #
################
.PHONY: server-js build-prod

server-js: $(SERVER_JS)

# transpiles the server typescript to js
$(SERVER_JS): .env $(NODE_MODULES) $(SERVER_TS)
	npm run -w packages/server build

build-prod: $(PROD_SERVER_CONTAINER)

# Builds rpgtools docker image
$(PROD_SERVER_CONTAINER): containers $(PROD_FRONTEND_JS) $(SERVER_JS)
	echo "Building version $(VERSION)"
	docker build -t zachanator070/rpgtools:latest -t zachanator070/rpgtools:$(VERSION) -f packages/server/Dockerfile --build-arg NODE_ENV=production .
	echo $(shell docker images | grep zachanator070/rpgtools:latest | awk '{print $3}' > $(PROD_SERVER_CONTAINER) )

############
# BUILD UI #
############
.PHONY: prod-ui build-with-stats

# transpiles the frontend tsx and typescript to js
prod-ui: $(PROD_FRONTEND_JS)

$(PROD_FRONTEND_JS): .env $(NODE_MODULES) $(FRONTEND_TS)
	NODE_ENV=production npm run --workspace=packages/frontend start
	> $(PROD_FRONTEND_JS)

$(DEV_FRONTEND_JS): .env $(FRONTEND_TS) $(NODE_MODULES)
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

ELECTRON_DEPS=$(PROD_NODE_MODULES_CACHE) $(DEV_NODE_MODULES_CACHE) $(PROD_FRONTEND_JS) $(SERVER_JS)

# creates executable
electron-package: $(ELECTRON_EXEC)

$(ELECTRON_EXEC): $(ELECTRON_DEPS)
	cp -R node_modules_prod/* packages/server/node_modules
	mkdir -p packages/server/node_modules/@rpgtools
	cp -R packages/common packages/server/node_modules/@rpgtools
	npm run -w packages/server package

# creates installable package
electron-make: $(ELECTRON_DEPS)
	cp -R node_modules_prod/* packages/server/node_modules
	mkdir -p packages/server/node_modules/@rpgtools
	cp -R packages/common packages/server/node_modules/@rpgtools
	npm run -w packages/server make
