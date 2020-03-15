VERSION=`git describe --abbrev=0 --tags`
CURRENT_UID=$(id -u):$(id -g)
export CURRENT_UID

build: prod-builder clean-uncompressed
	echo "Building version ${VERSION}"
	docker build -t rpgtools:latest -t rpgtools:${VERSION} -f src/server/Dockerfile .

prod-builder: clean init-env
	mkdir dist
	docker-compose up --build prod-builder

build-with-stats: BUILD_WITH_STATS=true
	export BUILD_WITH_STATS
build-with-stats: build

install-all:
	cp src/server/package.json package.json
	npm install
	cp src/app/package.json package.json
	npm install
	rm package.json

prod: build
	docker-compose up --build prod-server

dev: init-env dev-up logs

init-env:
	touch .env

dev-up:
	docker-compose up --build -d dev-server

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

stop:
	docker-compose stop

publish:
	docker login -u="${DOCKER_USERNAME}" -p="${DOCKER_PASSWORD}"
	docker tag rpgtools:${VERSION} ${DOCKER_USERNAME}/rpgtools:${VERSION}
	docker tag rpgtools:latest ${DOCKER_USERNAME}/rpgtools:latest
	docker push ${DOCKER_USERNAME}/rpgtools:latest
	docker push ${DOCKER_USERNAME}/rpgtools:${VERSION}

install:
	sudo apt update
	sudo apt install mongodb
	sudo mkdir /etc/rpgtools
	sudo cp .env.example /etc/rpgtools/.env
	sudo cp rpgtools.service /lib/systemd/system
	sudo systemd daemon-reload
	sudo systemd start rpgtools
	echo rpgtools is now available

clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf src/app/node_modules
	rm -rf src/server/node_modules

clean-uncompressed:
	rm -f dist/app.bundle.js
	rm -f dist/app.css
