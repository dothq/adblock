import React, { Component } from 'react'
import psl from 'psl'
const Vibrant = require('node-vibrant')

import { graphColors } from '../../constants/colors'

import { remoteFn } from '../../../backend/lib/remoteFunctions'
import { App } from './app'
import { BackendState } from '../../../constants/state'
import defaultFavicon from '../assets/defaultFavicon.svg'

const getDomain = (url: string) =>
  psl.parse(url.replace('https://', '').replace('http://', '').split('/')[0])
    .domain

const DEFAULT_COLOR = '#222222'

export type AppState = {
  blocked: number
  whitelisted: boolean
  favicon: string
  color: string
  backgroundState: BackendState
  totalBlocked: number
  hasPermissions: boolean
}

export class State extends Component {
  state: AppState = {
    blocked: 0,
    totalBlocked: 0,
    whitelisted: false,
    favicon: defaultFavicon,
    color: 'rgba(0,0,0,0)', // This creates a fade in with the color
    backgroundState: BackendState.Idle,
    hasPermissions: true,
  }

  componentDidMount(): void {
    browser.tabs
      .query({
        active: true,
        currentWindow: true,
      })
      .then(async (tab) => {
        const v = new Vibrant(
          tab[0].favIconUrl.includes('chrome://')
            ? defaultFavicon
            : tab[0].favIconUrl
        )
        const palette = await v.getPalette()
        const color =
          palette.Muted?.hex || palette.Vibrant?.hex || DEFAULT_COLOR

        this.setState({
          ...this.state,
          favicon: tab[0].favIconUrl || defaultFavicon,
          color: color,
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
          .map((url: string) => ({
            num: 1,
            url: getDomain(url),
          }))
          .filter(
            (
              curr: { url: string; num: number },
              i: number,
              arr: { url: string; num: number }[]
            ) => {
              const match = arr.findIndex(
                (t: { url: string }) => t.url === curr.url
              )
              const notDuplicate = match === i

              if (!notDuplicate) {
                arr[match].num = arr[match].num + 1
              }

              return notDuplicate
            }
          )

        let singleItem = 0
        blockedURLs.forEach(
          (element: { num: number }) => (singleItem += element.num)
        )
        const blockedNum = singleItem
        singleItem = 100 / singleItem

        this.setState({
          ads: blockedURLs.map(
            (url: { url: string; num: number }, i: number) => ({
              label: url.url,
              value: singleItem * url.num,
              color: getColor(i),
            })
          ),
          blocked: blockedNum,
        })
      }
    })

    remoteFn('getWhitelist').then(this.updateWhitelist.bind(this))
  }

  async updateWhitelist(whitelist: string[]): Promise<void> {
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

  async toggleWhitelist(): Promise<void> {
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

  render(): JSX.Element {
    return (
      <App
        state={this.state}
        setState={this.setState}
        toggleWhitelist={this.toggleWhitelist.bind(this)}
      />
    )
  }
}
