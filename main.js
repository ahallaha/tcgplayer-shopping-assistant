let undesiredLoaded = false
let preferredLoaded = false
let undesired = []
let preferred = []
let separator = ','

chrome.storage.sync.get(["preferred"], result => {
    if (result) {
        preferred = result.preferred.toString().split(/[,;]/).map(s => s.trim()).filter(x => x !== "")
    }
    preferredLoaded = true
    updatePage()
})

chrome.storage.sync.get(["undesired"], result => {
    if (result) {
        undesired = result.undesired.toString().split(/[,;]/).map(s => s.trim()).filter(x => x !== "")
    }
    undesiredLoaded = true
    updatePage()
})

chrome.storage.onChanged.addListener((_, __) => {
    location.reload()
})

const productObserver = new MutationObserver((_, __) => {
    const details = document.getElementsByClassName("listing-item product-details__listings-results")
    if (details.length > 0) {
        flagProductItems(details)
    }
})

const cartObserver = new MutationObserver((_, __) => {
    const indvSellerItems = document.getElementsByClassName("marketWrap")
    const directItems = document.getElementsByClassName("directWrap")
    if (indvSellerItems.length > 0 || directItems.length > 0) {
        flagCartItems(indvSellerItems, directItems)
    }
})

function updatePage() {
    if (undesiredLoaded && preferredLoaded) {
        if (window.location.href.includes("tcgplayer.com/product")) {
            productObserver.observe(document, {
                childList: true,
                subtree: true
            })
        } else if (window.location.href === "https://cart.tcgplayer.com/shoppingcart") {
            cartObserver.observe(document, {
                childList: true,
                subtree: true
            })
        }
    }
}

function addPreferredSeller (seller) {
    
    chrome.storage.sync.get(["preferred"], result => {
        if (result) {
            preferred = result.preferred.toString().split(/[,;]/).map(s => s.trim()).filter(x => x !== "")
            preferredLoaded = true
            if(preferred.includes(seller)){
                alert("Seller already in Preferred list")
            } else {
                var prefs = preferred + separator + seller
                chrome.storage.sync.set({"preferred" : prefs })
            }
            
        }
    })

    updatePage()
}

function addUndesiredSeller (seller) {
    
    chrome.storage.sync.get(["undesired"], result => {
        if (result) {
            undesired = result.undesired.toString().split(/[,;]/).map(s => s.trim()).filter(x => x !== "")
            undesiredLoaded = true
            if(undesired.includes(seller)){
                alert("Seller already in Undesired list")
            } else{
                var prefs = undesired + separator + seller
                chrome.storage.sync.set({"undesired" : prefs })
            }            
        }
    })

    updatePage()
}

function removeSellerFromLists (seller) {

    chrome.storage.sync.get(["undesired"], result => {
        if (result) {
            undesired = result.undesired.toString().split(/[,;]/).map(s => s.trim()).filter(x => x !== "")
            undesiredLoaded = true

            undesired = undesired.filter(x => x !== seller)

            chrome.storage.sync.set({"undesired" : undesired })
        }
    })

    chrome.storage.sync.get(["preferred"], result => {
        if (result) {
            preferred = result.preferred.toString().split(/[,;]/).map(s => s.trim()).filter(x => x !== "")
            undesiredLoaded = true

            var prefs = preferred.filter(x => x !== seller)

            chrome.storage.sync.set({"preferred" : prefs })
        }
    })

    updatePage()
}

function flagProductItems(details) {

    for (let item of details) {
        const sellerName = item.getElementsByClassName("seller-info__name")[0].textContent
        var x = sellerName.trim();
        if (undesired.includes(sellerName.trim())) {
            item.classList.add("seller-non-grata")
            item.getElementsByClassName("seller-info__name")[0].textContent = `❌${sellerName} `

            var clearBtn = document.createElement("button");
            clearBtn.innerHTML = '↪Clear';
            clearBtn.classList.add("clear-btn-styled");
            clearBtn.onclick = (function (x) {
                return function () {
                    removeSellerFromLists(x);
                };
            })(x);

            item.appendChild(clearBtn)

        } else if (preferred.includes(sellerName.trim())) {
            item.classList.add("super-seller")
            item.getElementsByClassName("seller-info__name")[0].textContent = `✔${sellerName} `

            var clearBtn = document.createElement("button");
            clearBtn.innerHTML = '↪Clear';
            clearBtn.classList.add("clear-btn-styled");
            clearBtn.onclick = (function (x) {
                return function () {
                    removeSellerFromLists(x);
                };
            })(x);

            item.appendChild(clearBtn)
        } else {
            
            var preferBtn = document.createElement("button");
            preferBtn.innerHTML = '✔Prefer';
            preferBtn.classList.add("preferred-btn-styled");
            
            preferBtn.onclick = (function (x) {
                return function () {
                    addPreferredSeller(x);
                };
            })(x);

            item.appendChild(preferBtn)

            var undesireBtn = document.createElement("button");
            undesireBtn.innerHTML = '❌Avoid';
            undesireBtn.classList.add("undesired-btn-styled");
            
            undesireBtn.onclick = (function (x) {
                return function () {
                    addUndesiredSeller(x);
                };
            })(x);

            item.appendChild(undesireBtn)
            
        }

    }

    productObserver.disconnect()
}

function flagCartItems(indvSellerItems, directItems) {
    for (let item of indvSellerItems) {
        const shippedByElements = item.getElementsByClassName("shippedBySeller")
        const sellerName =
            shippedByElements[0].textContent
                .replaceAll("Shipped by ", "")
                .replaceAll("Shop from this Seller", "")
                .trim()

        if (undesired.includes(sellerName)) {
            item.classList.add("seller-non-grata")
            item.getElementsByClassName("sellerName")[0].textContent = `❌ ${sellerName} `
        } else if (preferred.includes(sellerName)) {
            item.classList.add("super-seller")
            item.getElementsByClassName("sellerName")[0].textContent = `✔ ${sellerName} `
        }
    }

    for (let item of directItems) {
        const soldByElements = item.getElementsByClassName("soldBySeller")
        for (let soldByElement of soldByElements) {
            const sellerName =
                soldByElement.textContent
                    .replaceAll("Sold by ", "")
                    .trim()

            if (undesired.includes(sellerName)) {
                item.classList.add("seller-non-grata")
                const sellerUrl = Array.from(soldByElement.childNodes).find(node => node.nodeName.toUpperCase() === "A")
                item.getElementsByClassName("soldBySeller")[0].textContent = `❌ Sold by `
                createAnchor(soldByElement, sellerName, sellerUrl)
            } else if (preferred.includes(sellerName)) {
                item.classList.add("super-seller")
                const sellerUrl = Array.from(soldByElement.childNodes).find(node => node.nodeName.toUpperCase() === "A")
                item.getElementsByClassName("soldBySeller")[0].innerHTML = `✔  Sold by `
                createAnchor(soldByElement, sellerName, sellerUrl)
            }
        }
    }

    cartObserver.disconnect()
}

function createAnchor(element, sellerName, sellerUrl) {
    const a = document.createElement("a")
    const link = document.createTextNode(sellerName)
    a.appendChild(link)
    a.title = sellerName
    a.href = sellerUrl
    element.appendChild(a)
}