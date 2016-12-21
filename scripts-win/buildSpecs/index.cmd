rmdir /s  /q build\test

mkdir build\test\js
mkdir build\test\lib
xcopy test\jasmine\lib build\test\lib
copy /Y test\SpecsInBrowser.html build\test\SpecsInBrowser.html

node ./test/scripts/combinespecs.js
browserify ./build/test/js/globalspecs.js > ./build/test/js/specs.js
