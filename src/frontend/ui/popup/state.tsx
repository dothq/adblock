import React, { Component } from 'react'
import psl from 'psl'

import { graphColors } from '../../constants/colors'

import { remoteFn } from '../../../backend/lib/remoteFunctions'
import { App } from './app'
import { BackendState } from '../../../constants/state'

const getDomain = (url) =>
  psl.parse(url.replace('https://', '').replace('http://', '').split('/')[0])
    .domain

const DEFAULT_COLOR = '#256ef5'

export type AppState = {
  blocked: number
  whitelisted: boolean
  favicon: string
  color: string
  backgroundState: BackendState
  totalBlocked: number
}

export class State extends Component {
  state: AppState = {
    blocked: 0,
    totalBlocked: 0,
    whitelisted: false,
    // TODO [$605c3a4534b69900087896ff]: FIXME: Cannot use chrome:// in extensions without security issues
    favicon: 'chrome://mozapps/skin/places/defaultFavicon.svg',
    // TODO [$605c3a4534b6990008789700]: Make sure that the contrast between the text and the background works all the time
    color: 'rgba(0,0,0,0)', // This creates a fade in with the color
    backgroundState: BackendState.Idle,
  }

  componentDidMount() {
    browser.tabs
      .query({
        active: true,
        currentWindow: true,
      })
      .then(async (tab) => {
        // Get the theme color of the active tab
        const executed = await browser.tabs.executeScript(tab[0].id | 0, {
          code: `
          (() => {
            const themeColor = document.querySelector('meta[name="theme-color"]')
            const defaultColor = '${DEFAULT_COLOR}'

            if (themeColor !== null) return themeColor.getAttribute('content') 
            else return defaultColor
          })()
          `,
        })

        this.setState({
          ...this.state,
          favicon: tab[0].favIconUrl || DEFAULT_COLOR,
          color: executed[0] || DEFAULT_COLOR,
        })
      })

    remoteFn('getState').then((state) =>
      this.setState({ ...this.state, backgroundState: state })
    )

    remoteFn('getAllTrackersBlocked').then((count) =>
      this.setState({ ...this.state, totalBlocked: count })
    )

    remoteFn('getAds').then(async (blocked) => {
      // Get current tab
      const tab = await browser.tabs.query({
        active: true,
        currentWindow: true,
      })
      const tabId = tab[0].id

      // If this tab has had any ads blocked on it
      if (
        typeof blocked[tabId] !== 'undefined' &&
        blocked[tabId].length !== 0
      ) {
        // Something has been blocked. Do something with the data
        let blockedURLs = blocked[tabId]

        // Get a color for the graph
        const getColor = (i: number) => {
          let index = i

          while (index > graphColors.length - 1) {
            index = index - graphColors.length
          }

          return `#${graphColors[index]}`
        }

        blockedURLs = blockedURLs
          .map((url) => ({
            num: 1,
            url: getDomain(url),
          }))
          .filter((curr, i, arr) => {
            const match = arr.findIndex((t) => t.url === curr.url)
            const notDuplicate = match === i

            if (!notDuplicate) {
              arr[match].num = arr[match].num + 1
            }

            return notDuplicate
          })

        let singleItem = 0
        blockedURLs.forEach((element) => (singleItem += element.num))
        const blockedNum = singleItem
        singleItem = 100 / singleItem

        this.setState({
          ads: blockedURLs.map((url, i) => ({
            label: url.url,
            value: singleItem * url.num,
            color: getColor(i),
          })),
          blocked: blockedNum,
        })
      }
    })

    remoteFn('getWhitelist').then(this.updateWhitelist.bind(this))
  }

  async updateWhitelist(whitelist: string[]) {
    // Get current tab
    const tab = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })

    const tabURL = getDomain(tab[0].url)

    if (whitelist.indexOf(tabURL) !== -1) {
      this.setState({ ...this.state, whitelisted: true })
    } else {
      this.setState({ ...this.state, whitelisted: false })
    }
  }

  async toggleWhitelist() {
    // Common function
    const tab = await browser.tabs.query({
      active: true,
      currentWindow: true,
    })
    const tabURL = getDomain(tab[0].url)

    if (this.state.whitelisted) {
      // Remove from whitelist
      remoteFn('removeFromWhitelist', tabURL).then(
        this.updateWhitelist.bind(this)
      )
    } else {
      // Add to whitelist
      remoteFn('addToWhitelist', tabURL).then(this.updateWhitelist.bind(this))
    }
  }

  render() {
    return (
      <App
        state={this.state}
        setState={this.setState}
        toggleWhitelist={this.toggleWhitelist.bind(this)}
      />
    )
  }
}
