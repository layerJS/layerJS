mkdir dist
copy /Y build\layerjs.js dist\layerjs.js
copy /Y build\layerjs.js dist\layerjs-%npm_package_version%.js
copy /Y src\css\layerjs.css dist\layerjs.css
copy /Y src\css\layerjs.css dist\layerjs-%npm_package_version%.css
