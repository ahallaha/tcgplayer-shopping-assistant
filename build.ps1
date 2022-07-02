Remove-Item ./dist.zip

$compress = @{
  Path             = "./assets/icons", "entry.html", "main.js", "manifest.json", "popup.js", "styles.css"
  CompressionLevel = "Fastest"
  DestinationPath  = "./dist.zip"
}
Compress-Archive @compress