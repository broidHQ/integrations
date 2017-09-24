BASE_URL = http://schemas.broid.ai/
YAMLS = $(shell find src/schemas -name '*.yaml')
JSONS = $(YAMLS:.yaml=.json)

all: $(JSONS) src/schemas/index.json

clean:
	rm -rf lib/*
	rm -f $(JSONS) src/schemas/index.yaml

src/schemas/index.json: src/schemas/index.yaml
	js-yaml $< > lib/$(subst src/,,$@)

src/schemas/index.yaml: $(JSONS)
	echo $^ | xargs -n1 | sed 's/^src\/schemas\//- /;s/\.json$$//' > $@

prepare:
	mkdir -p lib/schemas/embedded
	mkdir -p lib/schemas/object

%.json: %.yaml prepare
	@echo Building $@
	(echo "id: '$(BASE_URL)$(subst src/schemas/,,$@)'"; cat $<) | js-yaml | json-minify | js-beautify -s 2 -b end-expand > lib/$(subst src/,,$@)
