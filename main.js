import { get, set, onChanged } from "./storage"
import { fetchSellerData } from "./backgroundScriptTriggers"

// Selectors for the elements we read and modify
// Used for checking if product details have been displayed
const productDetailsSelector = ".listing-item"
// Used for reading and modifying seller name text in product list
const sellerNameInProductListSelector = ".seller-info__name"
// Used to get non-direct seller tabs in cart
const cartSectionSelector = "section.tab-content.non-direct-package"
// Used for checking if items from individual sellers in cart have been displayed
// and for reading and modifying individual seller name text in cart
const shippedBySellerSelector = '[data-testid="linkPackageSellerName"]'
// Used to get seller location
const sellerLocationSelector = ".sellerInfo"
// Used to add seller location in product list
const sellerInfoInProductListSelector = ".seller-info"

let undesired = []
let preferred = []
let storageLocations = {}

get("preferred", (result) => {
  if (result && result.preferred) {
    preferred = result.preferred
      .split(/[,;\n]/)
      .map(cleanupSellerName)
      .filter(Boolean)
  }
})

get("undesired", (result) => {
  if (result && result.undesired) {
    undesired = result.undesired
      .split(/[,;\n]/)
      .map(cleanupSellerName)
      .filter(Boolean)
  }
})

get("locations", (result) => {
  if (result && result.locations) {
    storageLocations = result.locations
  }
})

onChanged((payload, _) => {
  if (payload.preferred || payload.undesired) {
    location.reload()
  }
})

const mainObserver = new MutationObserver((_, __) => {
  if (window.location.href.includes("tcgplayer.com/product")) {
    productObserver.observe(document, {
      childList: true,
      subtree: true,
    })
  }

  if (window.location.href.includes("tcgplayer.com/cart")) {
    cartObserver.observe(document, {
      childList: true,
      subtree: true,
    })
  }
})

const productObserver = new MutationObserver((_, __) => {
  const details = document.querySelectorAll(productDetailsSelector)

  if (details.length > 0) {
    flagProductItems(details)
  }
})

const cartObserver = new MutationObserver((_, __) => {
  const indvSellerItems = Array.from(
    document.querySelectorAll(cartSectionSelector)
  )

  // Need to check for textContent to make sure elements are hydrated
  if (indvSellerItems.length > 0 && indvSellerItems[0].textContent) {
    flagCartItems(indvSellerItems)
    cartObserver.disconnect()
  }
})

function createObserver() {
  mainObserver.observe(document, {
    childList: true,
    subtree: true,
  })
}

window.onload = createObserver

function flagProductItems(details) {
  for (let item of details) {
    // get good/bad sellers
    const sellerName = item.querySelector(
      sellerNameInProductListSelector
    ).textContent

    if (undesired.includes(cleanupSellerName(sellerName))) {
      item.classList.add("seller-non-grata")
      item.querySelector(
        sellerNameInProductListSelector
      ).textContent = `❌ ${sellerName} `
    } else if (preferred.includes(cleanupSellerName(sellerName))) {
      item.classList.add("super-seller")
      item.querySelector(
        sellerNameInProductListSelector
      ).textContent = `✔ ${sellerName} `
    }

    // get seller state
    if (!storageLocations || !storageLocations[sellerName]) {
      const sellerNameElem = item.querySelector(sellerNameInProductListSelector)
      if (sellerNameElem) {
        fetchSellerData(
          sellerNameElem.href,
          item,
          sellerName,
          processSellerData
        )
      }
    } else {
      addSellerLocation(item, storageLocations[sellerName])
    }
  }

  productObserver.disconnect()
}

// Note: Direct sellers are no longer listed alongside their direct items in your cart
function flagCartItems(indvSellerItems) {
  for (let item of indvSellerItems) {
    const sellerLabel = item.querySelector(shippedBySellerSelector)
    const sellerName = sellerLabel.textContent

    if (undesired.includes(cleanupSellerName(sellerName))) {
      item.classList.add("seller-non-grata")
      sellerLabel.textContent = `❌${sellerName}`
    } else if (preferred.includes(cleanupSellerName(sellerName))) {
      item.classList.add("super-seller")
      sellerLabel.textContent = `✔${sellerName}`
    }
  }
}

function cleanupSellerName(rawName) {
  return rawName.trim().toLowerCase()
}

function processSellerData(html, item, sellerName) {
  const location = extractSellerLocation(html)
  addSellerLocation(item, location)
  storageLocations[sellerName] = location
  set({ locations: storageLocations })
}

function extractSellerLocation(html) {
  const doc = document.createElement("html")
  doc.innerHTML = html
  const sellerInfo = doc.querySelector(sellerLocationSelector)
  let location = "Location: Direct"
  if (sellerInfo) {
    location = Array.from(sellerInfo.childNodes).filter(
      (node) => node.nodeName.toUpperCase() === "P"
    )[1].textContent
  }

  return location
}

function addSellerLocation(item, location) {
  if (!item.querySelector(".location")) {
    const t = document.createElement("span")
    t.textContent = location
    t.classList = ["location"]
    item.querySelector(sellerInfoInProductListSelector).appendChild(t)
  }
}
