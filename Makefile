

prod: build
	docker-compose up --build prod-server

build: prod-builder clean-uncompressed
	docker build -t rpgtools -f src/server/Dockerfile .

prod-builder: clean init-env
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
	docker tag rpgtools ${DOCKER_USERNAME}/rpgtools
	docker push ${DOCKER_USERNAME}/rpgtools

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
	rm -rf src/app/node_modules
	rm -rf src/server/node_modules

clean-uncompressed:
	rm dist/app.bundle.js
	rm dist/app.css
