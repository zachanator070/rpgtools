
dev: init-env build-docker-dev dev-up logs

init-env:
	touch .env

dev-up:
	docker-compose up -d dev

down:
	docker-compose down

logs:
	docker-compose logs -f

restart: down dev

stop:
	docker-compose stop

build:
	docker-compose up build-prod
	docker build -t rpgtools .

build-docker-dev:
	docker-compose build dev mongodb-dev build-dev

prod: build
	docker-compose up prod mongodb-prod redis-prod

publish:
	docker login -u="${DOCKER_USERNAME}" -p="${DOCKER_PASSWORD}"
	docker tag rpgtools $DOCKER_USERNAME/rpgtools
	docker push $DOCKER_USERNAME/rpgtools
