/// <reference types="web-ext-types"/>

import { parse } from 'psl'
import { FiltersEngine, Request } from '@cliqz/adblocker'

import { PermStore } from './permStore'
import { Settings } from './settings'
import { sleep } from './tempPort'
import { RequestListenerArgs } from './types'
import { defineFn, initFn } from './lib/remoteFunctions'
import {
  SHIELD_DB_ADS_AND_TRACKERS,
  SHIELD_DB_FAKE_NEWS,
  SHIELD_DB_GAMBLING,
  SHIELD_DB_SOCIAL,
} from './constants/db'
import { BackendState } from '../constants/state'
// let wasm = require('./rust/pkg')

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
// State code
let state = BackendState.Loading

// =================
// Blocking code
const getDomain = (url: string) =>
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
  // Set the state to loading
  state = BackendState.Loading

  // Wait for storage objects to load
  await whitelist.load()
  await settings.load()

  // Create what lists should be loaded
  const lists = [SHIELD_DB_ADS_AND_TRACKERS]

  // Add each list if selected
  if (settings.data.lists.fakeNews) {
    lists.push(SHIELD_DB_FAKE_NEWS)
  }
  if (settings.data.lists.gambling) {
    lists.push(SHIELD_DB_GAMBLING)
  }
  if (settings.data.lists.social) {
    lists.push(SHIELD_DB_SOCIAL)
  }

  // Create a filter list using the cliqz filter engine
  // TODO [#33]: Test if moving this into a webworker reduces addon load interruptions
  engine = await FiltersEngine.fromLists(fetch, lists)

  console.log('Engine loaded')

  browser.webRequest.onBeforeRequest.addListener(
    requestHandler,
    { urls: ['<all_urls>'] },
    ['blocking']
  )

  // Set state to idle
  state = BackendState.Idle
}

/**
 * Removes the event listener for blocking requests
 */
const close = () => {
  browser.webRequest.onBeforeRequest.removeListener(requestHandler)
}

// =================
// External interactions

// Removes an entry from the whitelist. Used by the popup
defineFn('removeFromWhitelist', async (site: string) => {
  whitelist.data = whitelist.data.filter((value) => value != site)
  console.log(whitelist.data)
  // The whitelist is sent back to update the UI
  return whitelist.data
})

// Adds an entry to the whitelist. Used by the popup
defineFn('addToWhitelist', async (site: string) => {
  whitelist.data.push(site)
  console.log(whitelist.data)
  // The whitelist is sent back to update the UI
  return whitelist.data
})

// Returns the whitelist for a UI (like the popup to use)
defineFn('getWhitelist', async () => whitelist.data)

// Gets all of the ads on active tabs so that a UI (like the popup) can render them
defineFn('getAds', async () => adsOnTabs)

// Restart the backend. Used by the settings ui when changes are made to settings
defineFn('reloadBackend', async () => {
  close()
  await init()
})

// Define a function that can be used to pull the long term statistics for displaying
// in the statistics page
defineFn('getLongTermStats', async () => ltBlocked.data)

// Define a function for getting cosmetic filters for each site
defineFn('getCosmeticsFilters', async (payload) => {
  // Wait for the engine to spawn
  while (typeof engine === 'undefined') {
    await sleep(100)
  }

  return engine.getCosmeticsFilters(payload)
})

// Function for getting the current state
// Can be used in the UI to show when the addon is loading
defineFn('getState', async () => state)

// Get the total number of trackers blocked
defineFn('getAllTrackersBlocked', async () => {
  let totalBlocked = 0

  for (const key in ltBlocked.data) {
    const blocked = ltBlocked.data[key]
    totalBlocked += blocked
  }

  return totalBlocked
})

// Start listening for function calls
initFn()

// Code to clean up the adsOnTabs variable. This will discard tabs that have been
// deleted or have changed their url
const tabRemoved = (tabId: number) => {
  if (typeof adsOnTabs[tabId] !== 'undefined') {
    console.log(`Tab removed: ${tabId}`)
    delete adsOnTabs[tabId]
  }
}

const tabUpdated = (params) => {
  const { tabId } = params
  if (typeof adsOnTabs[tabId] !== 'undefined') {
    console.log(`Tab reloaded: ${tabId}`)
    delete adsOnTabs[tabId]
  }
}

console.log(state)

browser.tabs.onRemoved.addListener(tabRemoved)
browser.webNavigation.onBeforeNavigate.addListener(tabUpdated)
;(async () => {
  // Wait for the rust code to load
  // wasm = await wasm

  // Call the init function, so the blocker starts by default
  init()
})()
