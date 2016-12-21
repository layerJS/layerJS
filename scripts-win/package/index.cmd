mkdir dist
copy /Y build\layerjs.js dist\layerjs.js
copy /Y build\layerjs.js dist\layerjs-%npm_package_version%.js
mkdir dist\css
copy /Y src\css\layerjs.css dist\css\layerjs.css
copy /Y src\css\layerjs.css dist\css\layerjs-%npm_package_version%.css
