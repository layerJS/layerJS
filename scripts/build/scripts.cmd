mkdir -p build
browserify -e src/layerjs.js -o build/layerjs.js
echo "$(bash scripts/info/index)\n" > build/info;
concat -o build/layerjs.js.tmp build/info build/layerjs.js
mv build/layerjs.js.tmp build/layerjs.js
