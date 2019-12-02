
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

build-docker-dev:
	docker-compose build dev mongodb-dev build-dev

build-docker-prod:
	docker-compose build prod mongodb-prod build-prod

prod: build-docker-prod
	docker-compose up prod mongodb-prod redis-prod
