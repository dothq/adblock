/// <reference types="web-ext-types"/>

import { parse } from 'psl'
import { FiltersEngine, Request } from '@cliqz/adblocker'

import { PopupConn, SettingsConn, StatsConn } from '../constants/settings'
import { PermStore } from './permStore'
import { Settings } from './settings'
import tempPort, { sleep } from './tempPort'
import { RequestListenerArgs } from './types'
import { CosmeticsConn } from './constants/portConnections'
let wasm = require('./rust/pkg')

// ================
// User settings
const settings = new Settings()

// ================
// Data collection
let adsOnTabs = {}
const ltBlocked = new PermStore('longTermBlockList', {})

// ===============
// Blocking engine
let engine: FiltersEngine

// =================
// Blocking related variable
const whitelist = new PermStore('whitelist', [])

// =================
// Blocking code
const getDomain = (url) =>
  parse(url.replace('https://', '').replace('http://', '').split('/')[0]).domain

/**
 * The listener for webRequests. Blocks all that it receives and adds them to logger
 * @param details The request info, provided by the requestHandler
 */
const requestHandler = (details: RequestListenerArgs) => {
  // Check if the site is contained in the whitelist
  // FIXME: URLS from a remote with a different url but are still from this tab are blocked

  // Check if the condition is in the blocklist
  const { match } = engine.match(Request.fromRawDetails(details))
  // Block it if it is
  if (!match) return

  const domain = getDomain(details.originUrl)
  if (whitelist.data.indexOf(domain) !== -1) return

  // TODO [#13]: Move data collection to rust

  // Record that this specific ad was seen on this tab
  // Check if the tab has been recorded
  if (typeof adsOnTabs[details.tabId] === 'undefined') {
    // Give it an empty array of values
    adsOnTabs[details.tabId] = []
  }
  // Push the url of the current tab onto the array
  adsOnTabs[details.tabId].push(details.url)

  const date = new Date()
  const currentDate = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`

  if (typeof ltBlocked.data[currentDate] == 'undefined') {
    ltBlocked.data[currentDate] = 0
  }
  ltBlocked.data[currentDate]++
  ltBlocked.storeData()

  return { cancel: true }
}

/**
 * Adds the event listener for blocking requests
 */
const init = async () => {
  // Wait for storage objects to load
  await whitelist.load()
  await settings.load()

  // Create a filter list using the cliqz filter engine
  // TODO: Allow the customization of this list
  // TODO: Generate default list in sheild db
  engine = await FiltersEngine.fromLists(fetch, [
    // Common lists
    'https://easylist.to/easylist/easylist.txt',
    'https://easylist.to/easylist/easyprivacy.txt',
    'https://hosts.netlify.app/Pro/adblock.txt',
    'https://block.energized.pro/ultimate/formats/filter',
  ])

  console.log('Engine loaded')

  browser.webRequest.onBeforeRequest.addListener(
    requestHandler,
    { urls: ['<all_urls>'] },
    ['blocking']
  )
}

/**
 * Removes the event listener for blocking requests
 */
const close = () => {
  browser.webRequest.onBeforeRequest.removeListener(requestHandler)
}

// =================
// External interactions

tempPort('co.dothq.shield.ui.popup', (p) => {
  p.onMessage.addListener((msg: any) => {
    console.log(msg)

    if (msg.type === PopupConn.getAds) {
      p.postMessage({ type: PopupConn.returnAds, payload: adsOnTabs })
    }

    if (msg.type === PopupConn.getWhitelist) {
      p.postMessage({
        type: PopupConn.returnWhitelist,
        payload: whitelist.data,
      })
    }

    if (msg.type === PopupConn.addWhitelist) {
      whitelist.data.push(msg.payload)

      // Resend the whitelist so the UI updates
      p.postMessage({
        type: PopupConn.returnWhitelist,
        payload: whitelist.data,
      })
    }

    if (msg.type === PopupConn.removeWhitelist) {
      whitelist.data = whitelist.data.filter((value) => value != msg.payload)

      // Resend the whitelist so the UI updates
      p.postMessage({
        type: PopupConn.returnWhitelist,
        payload: whitelist.data,
      })
    }
  })
})

// Interacts with the settings ui
tempPort('co.dothq.shield.ui.settings', (p) => {
  p.onMessage.addListener((msg: any) => {
    // The settings ui has requested a reload
    if (msg.type == SettingsConn.reload) {
      console.log('reload')

      close()
      init()
    }
  })
})

// Interacts with the stats ui
tempPort('co.dothq.shield.ui.stats', (p) => {
  p.onMessage.addListener((msg: any) => {
    if (msg.type == StatsConn.getLT) {
      // Send back LT stats
      p.postMessage({ type: StatsConn.returnLT, payload: ltBlocked.data })
    }
  })
})

// Cosmetic filter stuff
tempPort('co.dothq.shield.backend.cosmetics', (p) => {
  p.onMessage.addListener(async (msg: any) => {
    switch (msg.type) {
      // Get the cosmetics for this site and return it
      case CosmeticsConn.getCosmeticsForSite:
        // Wait for the engine to spawn
        while (typeof engine === 'undefined') {
          await sleep(100)
        }

        // Send the engine's cosmetic filter
        p.postMessage({
          type: CosmeticsConn.returnCosmeticsForSite,
          payload: engine.getCosmeticsFilters(msg.payload),
        })

        break

      default:
        break
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
;(async () => {
  // Wait for the rust code to load
  wasm = await wasm

  // Call the init function, so the blocker starts by default
  init()
})()
