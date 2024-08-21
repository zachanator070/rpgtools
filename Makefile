.EXPORT_ALL_VARIABLES:

VERSION=$(shell jq '.version' package.json | sed -e 's/^"//' -e 's/"/$//')
CURRENT_UID=$(shell id -u):$(shell id -g)

NODE_MODULES=node_modules/.package-lock.json
PROD_NODE_MODULES_CACHE=node_modules_prod/apollo-server/package.json
DEV_NODE_MODULES_CACHE=node_modules_dev/apollo-server/package.json
PROD_FRONTEND_JS=packages/frontend/dist/production.txt
DEV_FRONTEND_JS=packages/frontend/dist/development.txt
FRONTEND_TS=$(shell find packages/frontend/src -name *.ts)
SERVER_JS=packages/server/dist/server/src/index.js
SERVER_TS=$(shell find packages/server/src -name '*.ts' -o -name '*.js' -o -name '*.cjs' -o -name '*.html')
ELECTRON_EXEC=packages/server/out/@rpgtools-server-linux-x64/@rpgtools-server
ELECTRON_DEB=packages/server/out/make/deb/x64/rpgtools-server_$(VERSION)_amd64.deb

DEV_SERVER_CONTAINER=containers/dev-server.txt
DEV_SERVER_CONTAINER_SRC=packages/server/Dockerfile packages/server/tsconfig.json package-lock.json
DEV_SERVER_BRK_CONTAINER=containers/dev-server-brk.txt

DEV_FRONTEND_CONTAINER=containers/dev-ui.txt
FRONTEND_PACKAGE_JSON=packages/frontend/package.json

PROD_SERVER_CONTAINER=containers/prod-server.txt

NPM_COMMAND=docker compose run dev npm

################
# RUN COMMANDS #
################

# runs production version of docker image with minimal depending services
run-prod: .env $(PROD_SERVER_CONTAINER)
	docker compose up -d prod

# runs development docker environment with auto transpiling and restarting services upon file change
run-dev: .env packages/frontend/dist packages/server/dist/server db containers $(NODE_MODULES) $(DEV_SERVER_CONTAINER) $(DEV_FRONTEND_CONTAINER)
	docker compose up server ui-builder

# same as the `dev` target but makes the server wait for a debug connection before it starts the application
run-dev-brk: .env packages/frontend/dist  packages/server/dist/server db
	docker compose up server-brk ui-builder

run-mongodb: .env
	docker compose up -d mongodb

run-postgres: .env
	docker compose up -d postgres

# stops and destroys any running containers
down: .env
	docker compose down

# restart any running containers
restart: .env
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

run-electron: $(ELECTRON_EXEC)
	export SQLITE_DIRECTORY_PATH=db && ./$(ELECTRON_EXEC)

shell: .env
	docker compose run dev /bin/bash

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

test-integration-postgres: .env
	docker compose up -d postgres
	cp .env.example packages/server/jest.env
	sed -i '' 's/^#POSTGRES_HOST=postgres/POSTGRES_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker compose down

test-integration-mongodb: .env
	docker compose up -d mongodb
	cp .env.example packages/server/jest.env
	sed -i 's/^#MONGODB_HOST=mongodb/MONGODB_HOST=localhost/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker compose down

test-integration-sqlite: .env
	cp .env.example packages/server/jest.env
	sed -i 's/^#SQLITE_DIRECTORY_PATH=.*/SQLITE_DIRECTORY_PATH=db/' packages/server/jest.env
	npm run test:integration --workspace=packages/server
	docker compose down

test-e2e: test-e2e-mongodb test-e2e-postgres test-e2e-sqlite

test-e2e-mongodb: .env $(PROD_SERVER_CONTAINER)
	cp .env.example .env
	sed -i 's/#MONGODB_HOST=.*/MONGODB_HOST=mongodb/' .env
	docker compose up -d prod mongodb
	./wait_for_server.sh
	> packages/frontend/seed.log
	npm run -w packages/frontend test
	docker compose down

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

# pushes built docker container to dockerhub
publish:
	docker login -u="$(DOCKER_USERNAME)" -p="$(DOCKER_PASSWORD)"
	docker push zachanator070/rpgtools:$(VERSION)
	docker push zachanator070/rpgtools:latest

###############
# BUILD CLEAN #
###############

# cleans built transpiled js and node modules
clean: clean-deps clean-docker
	rm -rf db
	rm -rf packages/frontend/dist
	rm -rf packages/server/dist
	rm -rf packages/server/out

clean-deps:
	rm -rf node_modules
	rm -rf packages/frontend/node_modules
	rm -rf packages/server/node_modules
	rm -rf packages/common/node_modules
	-rm -rf node_modules_prod
	-rm -rf node_modules_dev

clean-docker: down
	-docker ps -a | grep rpgtools | awk '{print $$1}' | xargs docker rm -f
	-docker images -a | grep rpgtools | awk '{print $$3}' | xargs docker rmi -f
	-docker rmi zachanator070/rpgtools:latest
	-rm -rf containers

######################
# BUILD DEPENDENCIES #
######################

dev-deps: $(NODE_MODULES)

prod-deps: NODE_ENV=production
prod-deps: $(NODE_MODULES)

$(NODE_MODULES): .env package-lock.json
	${NPM_COMMAND} ci

$(PROD_NODE_MODULES_CACHE): .env
	${NPM_COMMAND} ci --omit=dev
	mkdir -p node_modules_prod
	cp -R node_modules/* node_modules_prod
	rm -rf node_modules_prod/@rpgtools

$(DEV_NODE_MODULES_CACHE): .env
	${NPM_COMMAND} ci
	mkdir -p node_modules_dev
	cp -R node_modules/* node_modules_dev

################
# BUILD SERVER #
################

server-js: $(SERVER_JS)

# transpiles the server typescript to js
$(SERVER_JS): .env $(NODE_MODULES) $(SERVER_TS) $(packages/server/dist/server/src/index.js)
	${NPM_COMMAND} run -w packages/server build

build-prod: $(PROD_SERVER_CONTAINER)

# Builds rpgtools docker image
$(PROD_SERVER_CONTAINER): $(PROD_FRONTEND_JS) $(SERVER_JS)
	echo "Building version $(VERSION)"
	docker build -t zachanator070/rpgtools:latest -t zachanator070/rpgtools:$(VERSION) -f packages/server/Dockerfile --build-arg NODE_ENV=production .
	echo $(shell docker images | grep zachanator070/rpgtools:latest | awk '{print $3}' > $(PROD_SERVER_CONTAINER) )

############
# BUILD UI #
############

# transpiles the frontend tsx and typescript to js
prod-ui: $(PROD_FRONTEND_JS)

$(PROD_FRONTEND_JS): .env $(NODE_MODULES) $(FRONTEND_TS)
	rm -rf packages/frontend/dist
	docker compose run -e NODE_ENV=production ui-builder npm run --workspace=packages/frontend start
	> $(PROD_FRONTEND_JS)

$(DEV_FRONTEND_JS): .env $(FRONTEND_TS) $(NODE_MODULES)
	rm -rf packages/frontend/dist
	docker compose run ui-builder npm run --workspace=packages/frontend start
	> $(DEV_FRONTEND_JS)

# builds transpiled js bundles with stats about bundle, stats end up in dist folder
build-with-stats: BUILD_WITH_STATS=true
build-with-stats: $(PROD_FRONTEND_JS)

#####################
# BUILD DIRECTORIES #
#####################

packages/frontend/dist:
	mkdir -p packages/frontend/dist
	chmod -R o+rw packages/frontend/dist

packages/server/dist/server:
	mkdir -p packages/server/dist/server

db:
	mkdir -p db

.env:
	cp .env.example .env

containers:
	mkdir -p containers

# builds local docker compose containers, usually only used in a dev environment
build-dev: .env $(DEV_FRONTEND_JS) $(SERVER_JS)
	docker compose build

$(DEV_SERVER_CONTAINER): .env $(DEV_SERVER_CONTAINER_SRC)
	docker compose build server
	echo $(shell docker images | grep rpgtools-server | awk '{print $3}' > $(DEV_SERVER_CONTAINER) )

$(DEV_SERVER_BRK_CONTAINER): .env $(DEV_SERVER_CONTAINER_SRC)
	docker compose build server-brk
	echo $(shell docker images | grep rpgtools-server-brk | awk '{print $3}' > $(DEV_SERVER_BRK_CONTAINER) )

$(DEV_FRONTEND_CONTAINER): .env $(FRONTEND_PACKAGE_JSON) packages/frontend/Dockerfile
	docker compose build ui-builder
	echo $(shell docker images | grep rpgtools-ui-builder | awk '{print $3}' > $(DEV_FRONTEND_CONTAINER) )

build-common:
	npm run -w packages/common build

##################
# BUILD ELECTRON #
##################

electron-prep:
	npm ci --omit=dev
	mkdir -p node_modules_prod
	cp -R node_modules/* node_modules_prod
	rm -rf node_modules_prod/@rpgtools

	npm ci
	mkdir -p node_modules_dev
	cp -R node_modules/* node_modules_dev

	NODE_ENV=production npm run --workspace=packages/frontend start

	NODE_ENV=production npm run -w packages/server build

	cp -R node_modules_prod/* packages/server/node_modules
	mkdir -p packages/server/node_modules/@rpgtools
	cp -R packages/common packages/server/node_modules/@rpgtools
	mkdir -p packages/server/dist/frontend
	cp -R packages/frontend/dist/* packages/server/dist/frontend

electron-package: electron-prep
	npm run -w packages/server package

electron-make: electron-prep
	npm run -w packages/server make

electron: electron-make

