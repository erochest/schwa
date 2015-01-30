
init:
	cabal sandbox init

tags:
	hasktags --ctags schwa-core/src schwa-scripts schwa-server/

distclean:
	cd schwa-core    && make clean
	cd schwa-scripts && make clean
	cd schwa-server  && make clean
	cabal sandbox delete

test:
	cd schwa-core    && make test
	cd schwa-scripts && make test
	cd schwa-server  && make test

.PHONY: init tags distclean test
