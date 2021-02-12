let blockedNum = 0
let domainsBlocked = {}

browser.runtime.onMessage.addListener((data, sender) => {
  if (data.type == 'get') {
    return { domainsBlocked, blockedNum }
  }
})

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    console.log(details.url)

    if (typeof domainsBlocked[details.url] == 'undefined') {
      domainsBlocked[details.url] = 0
    }

    blockedNum++
    domainsBlocked[details.url]++

    return { cancel: true }
  },
  { urls: blockedDomains },
  ['blocking']
)
