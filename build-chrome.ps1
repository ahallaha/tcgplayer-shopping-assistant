$ZipPath = "./chrome-dist.zip"

if (Test-Path $ZipPath) {
  Remove-Item $ZipPath
}

if (Test-Path "manifest.json") {
  Remove-Item "manifest.json"
}
Copy-Item "./chrome/manifest.json" -Destination "./manifest.json"

if (Test-Path "storage.js") {
  Remove-Item "storage.js"
}
Copy-Item "./chrome/storage.js" -Destination "./storage.js"

if (Test-Path "backgroundScript.js") {
  Remove-Item "backgroundScript.js"
}
Copy-Item "./chrome/backgroundScript.js" -Destination "./backgroundScript.js"

if (Test-Path "backgroundScriptTriggers.js") {
  Remove-Item "backgroundScriptTriggers.js"
}
Copy-Item "./chrome/backgroundScriptTriggers.js" -Destination "./backgroundScriptTriggers.js"

if (Test-Path "main.min.js") {
  Remove-Item "main.min.js"
}
npx rollup ./main.js --file ./main.min.js --format iife

if (Test-Path "popup.min.js") {
  Remove-Item "popup.min.js"
}
npx rollup ./popup.js --file ./popup.min.js --format iife

$compress = @{
  Path             = "./icons", "entry.html", "main.min.js", "manifest.json", "popup.min.js", "styles.css", "popup.css", "backgroundScript.js"
  CompressionLevel = "Fastest"
  DestinationPath  = $ZipPath
}
Compress-Archive @compress