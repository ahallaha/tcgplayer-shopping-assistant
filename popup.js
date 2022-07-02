const preferredInput = document.getElementById("preferred-sellers-input")
const undesiredInput = document.getElementById("undesired-sellers-input")

document.getElementById("save-button").addEventListener("click", () => {
    chrome.storage.sync.set({ "preferred": preferredInput.value })
    chrome.storage.sync.set({ "undesired": undesiredInput.value })
    window.close()
})

window.onload = function () {
    chrome.storage.sync.get(["preferred"], (result) => {
        if (result) {
            preferredInput.value = result.preferred
        }
    })
    chrome.storage.sync.get(["undesired"], (result) => {
        if (result) {
            undesiredInput.value = result.undesired
        }
    })
}