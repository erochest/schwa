
SRC=$(shell find src -name '*.hs')

PORT=9090

all: init test docs package

init:
	${CABAL} sandbox init
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

tags: ${SRC}
	hasktags --ctags *.hs src

hlint:
	hlint *.hs src specs

clean:
	${CABAL} clean

distclean: clean
	${CABAL} sandbox delete

configure: clean
	yesod configure ${FLAGS}

deps: clean
	${CABAL} install --only-dependencies --allow-newer ${FLAGS}
	make configure

build:
	yesod build

restart: distclean init build

rebuild: clean configure build

.PHONY: all init test run clean distclean configure deps build rebuild hlint
