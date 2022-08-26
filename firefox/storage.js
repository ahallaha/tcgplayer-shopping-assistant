export function get(name, callback) {
  browser.storage.local.get([name], (result) => {
    callback(result);
  });
}

export function set(dict) {
  browser.storage.local.set(dict);
}

export function onChanged(callback) {
  browser.storage.onChanged.addListener((changes, namespace) => {
    callback(changes, namespace);
  });
}
