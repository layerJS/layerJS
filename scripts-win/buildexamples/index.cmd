For /R examples %%G in (layerjs.js) do ( if exist "%%G" copy dist\layerjs.js "%%G")

For /R examples %%G in (layerjs.css) do (if exist "%%G" copy dist\css\layerjs.css "%%G")
