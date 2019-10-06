
dev: init-env build-docker dev-up logs

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

build-docker:
	docker-compose build

prod: build-docker
	docker-compose up prod mongodb-prod redis-prod
