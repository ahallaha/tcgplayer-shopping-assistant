import { set } from "./storage";

export function fetchLocation(
  item,
  storageLocations,
  sellerName,
  getLocation,
  setLocation
) {
  const url = item.getElementsByClassName("seller-info__name")[0].href;
  chrome.runtime.sendMessage(
    { contentScriptQuery: "queryState", url },
    (html) => {
      const location = getLocation(html);
      setLocation(item, location);
      storageLocations[sellerName] = location;
      set({ locations: storageLocations });
    }
  );
}
