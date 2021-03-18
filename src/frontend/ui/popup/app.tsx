import React, { Component } from 'react'
import psl from 'psl'

import { PopupConn } from '../../../constants/settings'
import { graphColors } from '../../constants/colors'
import { Button, Ring, Switch } from '../common'

import styles from './style.module.css'
import Favicon from '../common/favicon'

const backgroundScript = browser.runtime.connect({
  name: 'co.dothq.shield.ui.popup',
})

const getDomain = (url) =>
  psl.parse(url.replace('https://', '').replace('http://', '').split('/')[0])
    .domain

export class App extends Component {
  state = {
    ads: [
      {
        label: 'None',
        value: 100,
        color: getComputedStyle(document.documentElement).getPropertyValue(
          '--background-color-secondary'
        ),
      },
    ],
    blocked: 0,
    whitelisted: false,
    favicon: "chrome://mozapps/skin/places/defaultFavicon.svg"
  }

  componentDidMount() {
    browser.tabs.query({
      active: true,
      currentWindow: true,
    }).then((tab) => {
      this.setState({ 
        ...this.state,
        favicon: tab[0].favIconUrl
      })
    })

    backgroundScript.onMessage.addListener(async (msg: any) => {
      console.log(msg)

      // Check if this is a return value from a getAds function call
      if (msg.type === PopupConn.returnAds) {
        // Assign the payload to a more usefully named string
        const blocked = msg.payload

        // Get current tab
        const tab = await browser.tabs.query({
          active: true,
          currentWindow: true,
        })
        const tabId = tab[0].id

        console.log(tab[0])

        this.setState({ 
          ...this.state,
          favicon: tab[0].favIconUrl
        })

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
      } else if (msg.type === PopupConn.returnWhitelist) {
        // Get current tab
        const tab = await browser.tabs.query({
          active: true,
          currentWindow: true,
        })

        const whitelist: string[] = msg.payload
        const tabURL = getDomain(tab[0].url)

        if (whitelist.indexOf(tabURL) !== -1) {
          this.setState({ ...this.state, whitelisted: true })
        } else {
          this.setState({ ...this.state, whitelisted: false })
        }
      }
    })

    // Get assorted info from the background script
    backgroundScript.postMessage({ type: PopupConn.getWhitelist })
    backgroundScript.postMessage({ type: PopupConn.getAds })
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
      backgroundScript.postMessage({
        type: PopupConn.removeWhitelist,
        payload: tabURL,
      })
    } else {
      // Add to whitelist
      backgroundScript.postMessage({
        type: PopupConn.addWhitelist,
        payload: tabURL,
      })
    }
  }

  render() {
    return (
      <div className={styles.container}>
        <main className={`${styles.accent} ${this.state.whitelisted ? "" : styles.accentDisabled}`}>
          <div className={styles.itemBar}>
            <div style={{ justifyContent: "flex-start" }}>
              <Switch defaultState={this.state.whitelisted} checkedColour={"#b80000"} onChange={() => this.toggleWhitelist()} />
            </div>

            <div style={{ justifyContent: "center" }}>
              <Favicon icon={this.state.favicon} />
            </div>

            <div style={{ justifyContent: "flex-end" }}>
              <Switch defaultState={false} checkedColour={"#b80000"} onChange={() => this.toggleWhitelist()} />
            </div>
          </div>
        </main>

        <Ring
          data={this.state.ads}
          title={this.state.blocked.toString()}
          subtitle="Blocked"
        />

        bingus

        <div className={styles.controls}>
          <Button
            isPrimary={true}
            onClick={() => this.toggleWhitelist()}
            className={styles.controlDouble}
          >
            {this.state.whitelisted ? 'Block' : 'Allow'} ads and trackers on
            this site
          </Button>
          <Button onClick={() => window.open('./stats.html')}>
            View statistics
          </Button>
          <Button onClick={() => window.open('./settings.html')}>
            Settings
          </Button>
        </div>
      </div>
    )
  }
}
