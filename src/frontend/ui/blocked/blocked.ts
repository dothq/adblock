import psl from 'psl'

import { remoteFn } from '../../../backend/lib/remoteFunctions'

const getDomain = (url: string) =>
  psl.parse(url.replace('https://', '').replace('http://', '').split('/')[0])
    .domain

const params = new URLSearchParams(window.location.search)

if (params.has('list')) {
  const blocklist = params.get('list')

  const by = document.getElementById('by')
  by.innerText = `This page was blocked by the ${blocklist} list`
}

const whitelistA = document.getElementById('whitelist')

whitelistA.onclick = () => {
  remoteFn('addToWhitelist', getDomain(params.get('url'))).then(() =>
    setTimeout(() => (window.location.href = params.get('url')), 100)
  )
}
