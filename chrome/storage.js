export function get(name, callback) {
  chrome.storage.sync.get([name], (result) => {
    callback(result);
  });
}

export function set(dict) {
  chrome.storage.sync.set(dict);
}

export function onChanged(callback) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    callback(changes, namespace);
  });
}
