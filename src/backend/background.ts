/// <reference types="web-ext-types"/>

import { SettingsConn } from '../constants/settings'
import { getBlockedDomains } from './domains'
import tempPort from './tempPort'
import { RequestListenerArgs } from './types'
// const genPromise = require('./rust/src/main.rs')

let blockedNum = 0
let domainsBlocked = {}

// =================
// Blocking code

/**
 * The listener for webRequests. Blocks all that it receives and adds them to logger
 * @param details The request info, provided by the requestHandler
 */
const requestHandler = (details: RequestListenerArgs) => {
  console.log(details.url)

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

// Interacts with the settings ui
tempPort('co.dothq.shield.ui.settings', (p) => {
  console.log('Connected')
  p.onMessage.addListener((msg: any) => {
    console.log(msg)

    // The settings ui has requested a reload
    // Todo: Separate reload and update functions for lists
    if (msg.type == SettingsConn.reload) {
      console.log('reload')

      close()
      init()
    }
  })
})

//* Rust code stuff. Disabled for the moment, because we aren't using it
// To reenable, uncomment the following lines, the import statement at the top of
// the file, and the relevant comment in /webpack/webpack.common.js
// ;(async () => {
//   const gen = await genPromise
//   gen.init()
// })()
