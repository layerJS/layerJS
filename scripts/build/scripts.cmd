mkdir -p build
browserify -e src/layerjs.js -o build/layerjs.js
echo "$(bash scripts/info/index)\n$(cat build/layerjs.js)" > build/layerjs.js
