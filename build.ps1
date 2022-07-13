$ZipPath = "./dist.zip"

if (Test-Path $ZipPath) {
  Remove-Item $ZipPath
}

$compress = @{
  Path             = "./icons", "entry.html", "main.js", "manifest.json", "popup.js", "styles.css"
  CompressionLevel = "Fastest"
  DestinationPath  = $ZipPath
}
Compress-Archive @compress