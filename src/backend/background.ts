/// <reference types="web-ext-types"/>

import { SettingsConn } from '../constants/settings'
import blockedDomains from './domains'
import tempPort from './tempPort'

let blockedNum = 0
let domainsBlocked = {}

let settingsConn: browser.runtime.Port

tempPort(
  'co.dothq.shield.ui.settings',
  (p) => (settingsConn = p),
  (p) => {
    console.log('Connected')
    p.onMessage.addListener((msg: any) => {
      console.log(msg)
      if ((msg.type = SettingsConn.reload)) {
        console.log('reload')
      }
    })
  }
)

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
