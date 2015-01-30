
CABAL=cabal
SRC=$(shell find src -name '*.hs')

PORT=9090

all: init test docs package

init:
	make deps

test: build
	yesod test

dev:
	yesod devel --port=${PORT}

run:
	${CABAL} run


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

hlint:
	hlint *.hs src specs

clean:
	${CABAL} clean

configure: clean
	yesod configure ${FLAGS}

deps: clean
	${CABAL} install --only-dependencies --allow-newer ${FLAGS}
	make configure

build:
	yesod build

restart: clean init build

rebuild: clean configure build

.PHONY: all init test run clean configure deps build rebuild hlint
