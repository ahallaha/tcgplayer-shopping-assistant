chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery === "queryState") {
    fetch(request.url)
      .then((res) => {
        res.text().then(sendResponse)
      })
      .catch(console.log)
    return true
  }
})
