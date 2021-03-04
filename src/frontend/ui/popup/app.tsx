import React, { Component } from 'react'
import psl from 'psl'

import { PopupConn } from '../../../constants/settings'
import { graphColors } from '../../constants/colors'
import { Ring } from '../common/ring'

import styles from './style.module.css'
import { Button } from '../common/btn'

const backgroundScript = browser.runtime.connect({
  name: 'co.dothq.shield.ui.popup',
})

export class App extends Component {
  state = {
    ads: [
      {
        label: 'None',
        value: 100,
        color: '#C4C4C4',
      },
    ],
    blocked: 0,
    whitelisted: false,
  }

  componentDidMount() {
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
              url: psl.parse(
                url.replace('https://', '').replace('http://', '').split('/')[0]
              ).domain,
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

          console.log(blockedURLs)

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
      }
    })
    backgroundScript.postMessage({ type: PopupConn.getAds })
  }

  render() {
    console.log(this.state.ads)

    // TODO: Dark theme for popup
    // TODO: Move popup to URL bar

    return (
      <div className={styles.container}>
        <Ring
          data={this.state.ads}
          title={this.state.blocked.toString()}
          subtitle="Blocked"
        />

        <Button isPrimary={true}>Hello world</Button>
      </div>
    )
  }
}
