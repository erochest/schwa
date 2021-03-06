
SRC=$(shell find src -name '*.hs')

CABAL=stack
FLAGS=--enable-tests --pedantic

all: init test docs package

init: stack.yaml

stack.yaml:
	stack init --prefer-nightly

test: build
	stack test


run: build
	stack exec -- schwa


# docs:
# generate api documentation
#
# package:
# build a release tarball or executable
#
# dev:
# start dev server or process. `vagrant up`, `yesod devel`, etc.
#
# deploy:
# prep and push

install:
	stack install

tags: ${SRC}
	codex update

hlint:
	hlint *.hs src specs

clean:
	stack clean
	codex cache clean

distclean: clean

build:
	stack build

watch:
	ghcid "--command=stack ghci"

restart: distclean init build

rebuild: clean build

create-app:
	rhc app create schwa http://www.accursoft.com/cartridges/network.yml --no-scaling --from-code https://github.com/erochest/schwa.git --repo schwa-openshift --timeout 999999

.PHONY: all init test run clean distclean build rebuild hlint watch tags
