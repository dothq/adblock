/// <reference types="web-ext-types"/>

import psl from 'psl'

import { PopupConn, SettingsConn, StatsConn } from '../constants/settings'
import { Blacklist } from './blacklist'
import { PermStore } from './permStore'
import tempPort from './tempPort'
import { RequestListenerArgs } from './types'
let wasm = require('./rust/pkg')

// ================
// Performance settings
const blockingChunks = 10000 // Items. Splits it into chunks of 0-5ms on my computer
const chunkSeparator = 10 // ms

// ================
// Data collection
let adsOnTabs = {}
const ltBlocked = new PermStore('longTermBlockList', {})

// =================
// Blocking related variable
const whitelist = new PermStore('whitelist', [])
const blacklist = new Blacklist()

// =================
// Blocking code

const getDomain = (url) =>
  psl.parse(url.replace('https://', '').replace('http://', '').split('/')[0])
    .domain

/**
 * The listener for webRequests. Blocks all that it receives and adds them to logger
 * @param details The request info, provided by the requestHandler
 */
const requestHandler = (details: RequestListenerArgs) => {
  // Check if the site is contained in the whitelist
  // FIXME: URLS from a remote with a different url but are still from this tab are blocked

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

const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(() => resolve(false), time))

/**
 * Adds the event listener for blocking requests
 */
const init = async () => {
  // const domainsToBlock = await getBlockedDomains()
  await blacklist.load()

  // Wait for storage objects to load
  await whitelist.load()

  // console.log(blacklist.blacklist)

  // Loading each webRequest takes a long time. To combat this and increase the
  // browsers responsiveness whilst loading the block list, we separate the
  // blocklist into chunks determined by blockingChunks. These are then loaded
  // and the script is slept to allow requests to complete

  console.time('All webRequests')
  for (let i = 0; i < blacklist.blacklist.length; i += blockingChunks) {
    console.time('webRequest')
    browser.webRequest.onBeforeRequest.addListener(
      requestHandler,
      { urls: blacklist.blacklist.slice(i, i + blockingChunks) },
      ['blocking']
    )
    console.timeEnd('webRequest')

    // Sleep to allow other requests to be performed
    await sleep(chunkSeparator)
  }
  console.timeEnd('All webRequests')

  blacklist.cacheHandler(() => {
    close()
    init()
  })
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
  console.log('Connected')
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
  console.log('Connected')
  p.onMessage.addListener((msg: any) => {
    if (msg.type == StatsConn.getLT) {
      // Send back LT stats
      p.postMessage({ type: StatsConn.returnLT, payload: ltBlocked.data })
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
