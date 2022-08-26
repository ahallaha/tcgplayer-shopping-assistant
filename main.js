import { get, onChanged } from "./storage";

let undesiredLoaded = false;
let preferredLoaded = false;
let undesired = [];
let preferred = [];

get("preferred", (result) => {
  if (result) {
    preferred = result.preferred
      .split(/[,;]/)
      .map(cleanupSellerName)
      .filter((x) => x);
  }
  preferredLoaded = true;
  updatePage();
});

get("undesired", (result) => {
  if (result) {
    undesired = result.undesired
      .split(/[,;]/)
      .map(cleanupSellerName)
      .filter((x) => x);
  }
  undesiredLoaded = true;
  updatePage();
});

onChanged((_, __) => {
  location.reload();
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

const orderHistoryObserver = new MutationObserver((_, __) => {
  const orders = document.getElementsByClassName("orderWrap");
  if (orders.length > 0) {
    updateOrders(orders);
  }
});

function updatePage() {
  if (undesiredLoaded && preferredLoaded) {
    if (window.location.href.includes("tcgplayer.com/product")) {
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
    } else if (
      window.location.href ===
      "https://store.tcgplayer.com/myaccount/orderhistory"
    ) {
      orderHistoryObserver.observe(document, {
        childList: true,
        subtree: true,
      });
    }
  }
}

function flagProductItems(details) {
  for (let item of details) {
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

function updateOrders(orders) {
  for (let item of orders) {
    const sellerElem =
      item.getElementsByClassName("orderContent")[0].children[3];

    // only handle individual sellers right now
    if (sellerElem.children[0].innerText === "SHIPPED AND SOLD BY") {
      const sellerName = sellerElem.children[2].children[0].innerText;

      const prefButton = document.createElement("input");
      prefButton.type = "button";
      prefButton.value = "Add to Preferred";
      prefButton.classList.add("catalogBlueButton");
      prefButton.addEventListener("click", (_) => {
        chrome.storage.sync.set({
          preferred: [...preferred, sellerName].join(", "),
        });
      });

      const undesButton = document.createElement("input");
      undesButton.type = "button";
      undesButton.value = "Add to Undesired";
      undesButton.classList.add("catalogBlueButton");
      undesButton.addEventListener("click", (_) => {
        chrome.storage.sync.set({
          undesired: [...undesired, sellerName].join(", "),
        });
      });

      const orderButtons =
        item.getElementsByClassName("orderHeader")[0].children[3];
      orderButtons.appendChild(prefButton);
      orderButtons.appendChild(undesButton);
    }
  }
  orderHistoryObserver.disconnect();
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
