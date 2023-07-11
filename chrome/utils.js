import { set } from "./storage"

export function fetchLocation(
  item,
  storageLocations,
  sellerNameSelector,
  sellerName,
  getLocation,
  setLocation
) {
  const sellerNames = item.querySelectorAll(sellerNameSelector)

  if (sellerNames.length) {
    const url = sellerNames[0].href
    chrome.runtime.sendMessage(
      { contentScriptQuery: "queryState", url },
      (html) => {
        const location = getLocation(html)
        setLocation(item, location)
        storageLocations[sellerName] = location
        set({ locations: storageLocations })
      }
    )
  }
}
