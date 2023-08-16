export function fetchSellerData(url, item, sellerName, processSellerData) {
  chrome.runtime.sendMessage(
    { contentScriptQuery: "queryState", url },
    (html) => {
      processSellerData(html, item, sellerName)
    }
  )
}
