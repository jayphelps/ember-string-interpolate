LICENSE = "/**\n * Ember.String.interpolate / String.interpolate.js\n * (c) 2013 Jay Phelps\n * MIT Licensed\n * https://github.com/jayphelps/ember-string-interpolate\n * https://github.com/jayphelps/string.interpolate.js\n */"

# Files ========================================================================

SRC_FILES = lib/string.interpolate.js/string.interpolate.js \
            src/ember-string-interpolate.js

OUTPUT_FILE = ember-string-interpolate.js
OUTPUT_FILE_MIN = ember-string-interpolate.min.js
TMP = /tmp/$(OUTPUT_FILE)

# Targets ======================================================================

all:
	@awk 'FNR==1{print ""}1' $(SRC_FILES) > $(OUTPUT_FILE)
	@curl -s --data-urlencode js_code@${OUTPUT_FILE} -o ${OUTPUT_FILE_MIN} http://marijnhaverbeke.nl/uglifyjs
	@echo $(LICENSE) | cat - $(OUTPUT_FILE_MIN) > $(TMP) && mv $(TMP) $(OUTPUT_FILE_MIN)
