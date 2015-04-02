
SRC=$(shell find src -name '*.hs')

CABAL=cabal
FLAGS=--enable-tests

all: init test docs package

init: deps

test: build
	${CABAL} test --test-option=--color

specs: build
	./dist/build/schwa-core-specs/schwa-core-specs

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

distclean: clean

configure: clean
	${CABAL} configure ${FLAGS}

deps: clean
	${CABAL} install --only-dependencies --allow-newer ${FLAGS}
	make configure

build:
	${CABAL} build

restart: clean init build

rebuild: clean configure build

.PHONY: all init test run clean configure deps build rebuild hlint
