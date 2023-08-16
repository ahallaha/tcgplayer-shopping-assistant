import { set } from "./storage"

export function fetchLocation(
  item,
  storageLocations,
  sellerNameSelector,
  sellerName,
  getLocation,
  setLocation
) {
  const sellerNames = item.querySelector(sellerNameSelector)

  if (sellerNames) {
    const url = sellerNames.href
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
