let details

let undesiredLoaded = false
let preferredLoaded = false
let undesired = []
let preferred = []

chrome.storage.sync.get(["preferred"], result => {
    if (result) {
        preferred = result.preferred.split(";").map(s => s.trim()).filter(x => x !== "")
    }
    preferredLoaded = true
})

chrome.storage.sync.get(["undesired"], result => {
    if (result) {
        undesired = result.undesired.split(";").map(s => s.trim()).filter(x => x !== "")
    }
    undesiredLoaded = true
})

chrome.storage.onChanged.addListener((_, __) => {
    location.reload()
})

function flagItems() {
    // wait for preferences to load from storage
    while (!(undesiredLoaded && preferredLoaded)) { }
    for (let item of details) {
        const sellerName = item.getElementsByClassName("seller-info__name")[0].textContent
        if (undesired.includes(sellerName.trim())) {
            item.classList.add("seller-non-grata")
            item.getElementsByClassName("seller-info__name")[0].textContent = `❌${sellerName} `
        }

        if (preferred.includes(sellerName.trim())) {
            item.classList.add("super-seller")
            item.getElementsByClassName("seller-info__name")[0].textContent = `✔${sellerName} `
        }
    }
}

const observer = new MutationObserver((_, __) => {
    details = document.getElementsByClassName("listing-item product-details__listings-results")
    if (details.length > 0) {
        flagItems()
    }
})

observer.observe(document, {
    childList: true,
    subtree: true
})