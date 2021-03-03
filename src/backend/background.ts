/// <reference types="web-ext-types"/>

import { PopupConn, SettingsConn } from '../constants/settings'
import { getBlockedDomains } from './domains'
import tempPort from './tempPort'
import { RequestListenerArgs } from './types'
// const genPromise = require('./rust/src/main.rs')

let blockedNum = 0
let domainsBlocked = {}
let adsOnTabs = {}

// =================
// Blocking code

/**
 * The listener for webRequests. Blocks all that it receives and adds them to logger
 * @param details The request info, provided by the requestHandler
 */
const requestHandler = (details: RequestListenerArgs) => {
  console.log('Blocked')

  // Record that this specific ad was seen on this tab
  // Check if the tab has been recorded
  if (typeof adsOnTabs[details.tabId] === 'undefined') {
    // Give it an empty array of values
    adsOnTabs[details.tabId] = []
  }
  // Push the url of the current tab onto the array
  adsOnTabs[details.tabId].push(details.url)

  if (typeof domainsBlocked[details.url] == 'undefined') {
    domainsBlocked[details.url] = 0
  }

  blockedNum++
  domainsBlocked[details.url]++

  return { cancel: true }
}

/**
 * Adds the event listener for blocking requests
 */
const init = async () => {
  const domainsToBlock = await getBlockedDomains()

  console.log(domainsToBlock)

  browser.webRequest.onBeforeRequest.addListener(
    requestHandler,
    { urls: domainsToBlock },
    ['blocking']
  )
}

/**
 * Removes the event listener for blocking requests
 */
const close = () => {
  browser.webRequest.onBeforeRequest.removeListener(requestHandler)
}

// Call the init function, so the blocker starts by default
init()

// =================
// External interactions

tempPort('co.dothq.shield.ui.popup', (p) => {
  p.onMessage.addListener((msg: any) => {
    if (msg.type === PopupConn.getAds) {
      p.postMessage({ type: PopupConn.returnAds, payload: adsOnTabs })
    }
  })
})

// Interacts with the settings ui
tempPort('co.dothq.shield.ui.settings', (p) => {
  console.log('Connected')
  p.onMessage.addListener((msg: any) => {
    console.log(msg)

    // The settings ui has requested a reload
    if (msg.type == SettingsConn.reload) {
      console.log('reload')

      close()
      init()
    }
  })
})

// Code to clean up the adsOnTabs variable. This will discard tabs that have been
// deleted or have changed their url
const tabRemoved = (tabId: number) => {
  if (typeof adsOnTabs[tabId] !== 'undefined') {
    console.log(`Tab removed: ${tabId}`)
    delete adsOnTabs[tabId]
  }
}

const tabUpdated = ({ tabId }) => {
  if (typeof adsOnTabs[tabId] !== 'undefined') {
    console.log(`Tab reloaded: ${tabId}`)
    delete adsOnTabs[tabId]
  }
}

browser.tabs.onRemoved.addListener(tabRemoved)
browser.webNavigation.onBeforeNavigate.addListener(tabUpdated)

//* Rust code stuff. Disabled for the moment, because we aren't using it
// To reenable, uncomment the following lines, the import statement at the top of
// the file, and the relevant comment in /webpack/webpack.common.js
// ;(async () => {
//   const gen = await genPromise
//   gen.init()
// })()
