import { get, onChanged } from "./storage";
import { fetchLocation } from "./utils";

let undesiredLoaded = false;
let preferredLoaded = false;
let locationsLoaded = false;
let undesired = [];
let preferred = [];
let storageLocations = {};

get("preferred", (result) => {
  if (result) {
    preferred = result.preferred
      .split(/[,;\n]/)
      .map(cleanupSellerName)
      .filter((x) => x);
  }
  preferredLoaded = true;
  updatePage();
});

get("undesired", (result) => {
  if (result) {
    undesired = result.undesired
      .split(/[,;\n]/)
      .map(cleanupSellerName)
      .filter((x) => x);
  }

  undesiredLoaded = true;
  updatePage();
});

get("locations", (result) => {
  if (result && result.locations) {
    storageLocations = result.locations;
  }

  locationsLoaded = true;
  updatePage();
});

onChanged((payload, _) => {
  if (payload.preferred || payload.undesired) {
    location.reload();
  }
});

const productObserver = new MutationObserver((_, __) => {
  const details = document.getElementsByClassName(
    "listing-item product-details__listings-results"
  );
  if (details.length > 0) {
    flagProductItems(details);
  }
});

const cartObserver = new MutationObserver((_, __) => {
  const indvSellerItems = document.getElementsByClassName("marketWrap");
  const directItems = document.getElementsByClassName("directWrap");
  if (indvSellerItems.length > 0 || directItems.length > 0) {
    flagCartItems(indvSellerItems, directItems);
  }
});

function updatePage() {
  if (undesiredLoaded && preferredLoaded) {
    if (
      window.location.href.includes("tcgplayer.com/product") &&
      locationsLoaded
    ) {
      productObserver.observe(document, {
        childList: true,
        subtree: true,
      });
    } else if (
      window.location.href === "https://cart.tcgplayer.com/shoppingcart"
    ) {
      cartObserver.observe(document, {
        childList: true,
        subtree: true,
      });
    }
  }
}

function flagProductItems(details) {
  for (let item of details) {
    // get good/bad sellers
    const sellerName =
      item.getElementsByClassName("seller-info__name")[0].textContent;
    if (undesired.includes(cleanupSellerName(sellerName))) {
      item.classList.add("seller-non-grata");
      item.getElementsByClassName(
        "seller-info__name"
      )[0].textContent = `❌ ${sellerName} `;
    } else if (preferred.includes(cleanupSellerName(sellerName))) {
      item.classList.add("super-seller");
      item.getElementsByClassName(
        "seller-info__name"
      )[0].textContent = `✔ ${sellerName} `;
    }

    // get seller state
    if (!storageLocations || !storageLocations[sellerName]) {
      fetchLocation(
        item,
        storageLocations,
        sellerName,
        getSellerLocation,
        addSellerLocation
      );
    } else {
      addSellerLocation(item, storageLocations[sellerName]);
    }
  }
  productObserver.disconnect();
}

function flagCartItems(indvSellerItems, directItems) {
  for (let item of indvSellerItems) {
    const shippedByElements = item.getElementsByClassName("shippedBySeller");
    const sellerName = shippedByElements[0].textContent
      .replaceAll("Shipped by ", "")
      .replaceAll("Shop from this Seller", "");

    if (undesired.includes(cleanupSellerName(sellerName))) {
      item.classList.add("seller-non-grata");
      item.getElementsByClassName(
        "sellerName"
      )[0].textContent = `❌${sellerName}`;
    } else if (preferred.includes(cleanupSellerName(sellerName))) {
      item.classList.add("super-seller");
      item.getElementsByClassName(
        "sellerName"
      )[0].textContent = `✔${sellerName}`;
    }
  }

  for (let item of directItems) {
    const soldByElements = item.getElementsByClassName("soldBySeller");

    for (let soldByElement of soldByElements) {
      const sellerName = soldByElement.innerText.replaceAll("Sold by ", "");

      if (undesired.includes(cleanupSellerName(sellerName))) {
        item.classList.add("seller-non-grata");
        const sellerUrl = Array.from(soldByElement.childNodes).find(
          (node) => node.nodeName.toUpperCase() === "A"
        );
        soldByElement.textContent = `❌ Sold by `;
        appendAnchor(soldByElement, sellerName, sellerUrl);
      } else if (preferred.includes(cleanupSellerName(sellerName))) {
        item.classList.add("super-seller");
        const sellerUrl = Array.from(soldByElement.childNodes).find(
          (node) => node.nodeName.toUpperCase() === "A"
        );
        soldByElement.textContent = `✔ Sold by `;
        appendAnchor(soldByElement, sellerName, sellerUrl);
      }
    }
  }

  cartObserver.disconnect();
}

function appendAnchor(element, sellerName, sellerUrl) {
  const a = document.createElement("a");
  const link = document.createTextNode(sellerName);
  a.appendChild(link);
  a.title = sellerName;
  a.href = sellerUrl;
  element.appendChild(a);
}

function cleanupSellerName(rawName) {
  return rawName.trim().toLowerCase();
}

function getSellerLocation(html) {
  const doc = document.createElement("html");
  doc.innerHTML = html;
  const sellerInfo = doc.getElementsByClassName("sellerInfo")[0];
  let location = "Location: Direct";
  if (sellerInfo) {
    location = Array.from(sellerInfo.childNodes).filter(
      (node) => node.nodeName.toUpperCase() === "P"
    )[1].textContent;
  }

  return location;
}

function addSellerLocation(item, location) {
  const t = document.createTextNode(location);
  item.getElementsByClassName("seller-info")[0].appendChild(t);
}
