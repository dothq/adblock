console.log('block')

let blocked = []

// browser.webRequest.RequestFilter.urls = [
//   ...browser.webRequest.RequestFilter.urls,
//   ...blockedDomains,
// ]

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log(details.url)
    return { cancel: true }
  },
  { urls: blockedDomains },
  ['blocking']
)
