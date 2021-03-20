// This performs cosmetic filtering on each website

import { parse } from 'psl'
import { remoteFn } from '../lib/remoteFunctions'

const getDomain = (url: string) =>
  parse(url.replace('https://', '').replace('http://', '').split('/')[0]).domain

// Get all of the variables needed to request the cosmetics for this page
const url = window.location.href
const hostname = window.location.hostname
const domain = getDomain(url)

;(async () => {
  const payload = await remoteFn('getCosmeticsFilters', {
    url,
    hostname,
    domain,
  })

  if (payload.active) {
    if (payload.styles) {
      // Create a style element to be appended to the head of the webpage
      const style = document.createElement('style')
      // Add the stylesheet sent to us to it (this has to be done as a textNode)
      style.append(document.createTextNode(payload.styles))
      // Append the style to the head
      document.head.append(style)
    }
  }

  console.log('Cosmetics added')
})()
