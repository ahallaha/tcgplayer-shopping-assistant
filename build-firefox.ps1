$ZipPath = "./firefox-dist.zip"

if (Test-Path $ZipPath) {
  Remove-Item $ZipPath
}

if (Test-Path "manifest.json") {
  Remove-Item "manifest.json"
}
Copy-Item "./firefox/manifest.json" -Destination "./manifest.json"

if (Test-Path "storage.js") {
  Remove-Item "storage.js"
}
Copy-Item "./firefox/storage.js" -Destination "./storage.js"

if (Test-Path "main.min.js") {
  Remove-Item "main.min.js"
}
npx rollup ./main.js --file ./main.min.js --format iife

if (Test-Path "popup.min.js") {
  Remove-Item "popup.min.js"
}
npx rollup ./popup.js --file ./popup.min.js --format iife

$7ZipPath = "C:/Program Files/7-Zip/7z.exe"

if (-not (Test-Path -Path $7zipPath -PathType Leaf)) {
  throw "7 zip file '$7zipPath' not found"
}

Set-Alias 7zip $7zipPath
7zip a -tzip $ZipPath "./icons", "entry.html", "main.min.js", "manifest.json", "popup.min.js", "styles.css"
