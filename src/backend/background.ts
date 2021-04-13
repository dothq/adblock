/// <reference types="web-ext-types"/>

import { parse } from 'psl'
import { FiltersEngine, Request } from '@cliqz/adblocker'

import { PermStore } from './permStore'
import { Settings } from './settings'
import { sleep } from './tempPort'
import { RequestListenerArgs } from './types'
import { defineFn, initFn } from './lib/remoteFunctions'
import { BackendState } from '../constants/state'
import { timeEnd, timeStart } from './lib/logger'
import { createStylesheetFromRules } from './lib/cosmeticFuncs'

// let wasm = require('./rust/pkg')

// Load the engineCreator webworker
const engineCreator = new Worker(new URL('./engineCreator.js', import.meta.url))

// ================
// User settings
const settings = new Settings()

// ================
// Data collection
const adsOnTabs = {}
const ltBlocked = new PermStore('longTermBlockList', {})

// ===============
// Blocking engine
let engine: FiltersEngine
let globalCosmetics: string

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

const createEngine: () => Promise<Uint8Array> = () =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve) => {
    await settings.checkLoad()

    engineCreator.onmessage = (engine) => resolve(engine.data as Uint8Array)
    engineCreator.postMessage(settings.data)
  })

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

  timeStart('Engine loaded')
  engine = FiltersEngine.deserialize(await createEngine())
  timeEnd('Engine loaded')

  browser.webRequest.onBeforeRequest.addListener(
    requestHandler,
    { urls: ['<all_urls>'] },
    ['blocking']
  )

  timeStart('Get domainless rules')

  const domainless = engine.cosmetics
    .getFilters()
    .filter(({ domains }) => typeof domains === 'undefined')
    .filter(({ selector }) => typeof selector === 'string')

  globalCosmetics = createStylesheetFromRules(domainless)
    .replace('\r', '\n')
    .replace('\n', '')

  console.log(globalCosmetics)

  timeEnd('Get domainless rules')
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
  // The whitelist is sent back to update the UI
  return whitelist.data
})

// Adds an entry to the whitelist. Used by the popup
defineFn('addToWhitelist', async (site: string) => {
  whitelist.data.push(site)
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
  init()
})

// Define a function that can be used to pull the long term statistics for displaying
// in the statistics page
defineFn('getLongTermStats', async () => ltBlocked.data)

// Define a function for getting cosmetic filters for each site
defineFn('getCosmeticsFilters', async (payload) => {
  // Wait for the engine to spawn, then grab the cosmetics filters
  return (
    // Get the site specific cosmetics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (await waitForEngine()).cosmetics.getCosmeticsFilters(payload as any)
  )
})

// Defines a function to collet the base stylesheet from the engine to be applied
// to a website on a separate thread.
defineFn('getGlobalCosmetics', async () => {
  // Wait for the global cosmetics to be generated
  return await waitForDynamic(() => globalCosmetics)
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

// Start listening for function calls defined by defineFn. Note that these function
// calls are intended to be used from a separate thread, hence why they are
// more complicated to define
initFn()

// Code to clean up the adsOnTabs variable. This will discard tabs that have been
// deleted or have changed their url
const tabRemoved = (tabId: number) => {
  if (typeof adsOnTabs[tabId] !== 'undefined') {
    delete adsOnTabs[tabId]
  }
}

const tabUpdated = (params) => {
  const { tabId } = params
  if (typeof adsOnTabs[tabId] !== 'undefined') {
    delete adsOnTabs[tabId]
  }
}

browser.tabs.onRemoved.addListener(tabRemoved)
browser.webNavigation.onBeforeNavigate.addListener(tabUpdated)
;(async () => {
  // Wait for the rust code to load
  // wasm = await wasm

  // Call the init function, so the blocker starts by default
  init()
})()

// =============================================================================
// Util functions

async function waitForDynamic<DynamicType>(
  fn: () => DynamicType | undefined
): Promise<DynamicType> {
  // Wait for the dynamic to stop being undefined
  while (typeof fn() === 'undefined') {
    await sleep(100)
  }

  // Return dynamic for convenience
  return fn()
}

/**
 * Waits for the engine to start then returns
 */
const waitForEngine = async () => {
  // Wait for the engine to spawn
  return await waitForDynamic(() => engine)
}
