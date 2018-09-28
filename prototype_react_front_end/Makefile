
.PHONY: all main


all: main deploy


main:
	npm run build

deploy:
	rsync -av build/static/ ../prototype/static/
	rsync -v build/* ../prototype/static/
	rsync -v build/index.html ../prototype/templates/prototype/
