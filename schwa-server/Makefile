
SRC=$(shell find . -name '*.hs')
BUILD_FLAGS=--flag schwa-server:dev
# BUILD_FLAGS=

PORT=9090

all: init test docs package

init: deps

test:
	stack test

dev:
	stack build --flag schwa-server:dev
	make run

run:
	stack exec -- schwa-server


# docs:
# generate api documentation
#
# package:
# build a release tarball or executable
#
# dev:
# start dev server or process. `vagrant up`, `yesod devel`, etc.
#
# install:
# generate executable and put it into `/usr/local`
#
# deploy:
# prep and push

tags: ${SRC}
	codex update

hlint:
	hlint *.hs src specs

clean:
	stack clean

distclean: clean

deps:
	stack deps

build:
	stack build $(BUILD_FLAGS)

watch:
	arion . src specs

restart: distclean init build

rebuild: clean configure build

.PHONY: all init test run clean distclean configure deps build rebuild hlint watch
