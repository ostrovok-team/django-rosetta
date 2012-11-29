BASE_FOLDER := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))
PLOVR=java -jar $(BASE_FOLDER)/plovr.jar

serve:
	plovr serve config.json

build:
	$(PLOVR) build $(BASE_FOLDER)/config.json
	sed 's/goog.LOCALE="en";//' $(BASE_FOLDER)/gcinui.js > $(BASE_FOLDER)/gcinui-seded.js
	rm $(BASE_FOLDER)/gcinui.js
	mv $(BASE_FOLDER)/gcinui-seded.js $(BASE_FOLDER)/gcinui.js

