.PHONY: ui tools docker-compose-build docker-compose

tools:
	sudo npm i -g less
	sudo npm i -g browserify
	sudo npm i -g jshint

ui:
	cd prototype/static/prototype; npm i; make


docker-compose-build: ui
	docker-compose build

docker-compose:
	docker-compose up
