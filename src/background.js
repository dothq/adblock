const block = (details) => ({ cancel: true })

browser.webRequest.RequestFilter.urls = [
  ...browser.webRequest.RequestFilter.urls,
  ...blockedDomains,
]

// browser.webRequest.onBeforeRequest.addListener(
//   block,
//   { urls: blockedDomains },
//   ['blocking']
// )
