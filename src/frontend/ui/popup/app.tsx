import { Component } from 'react'
import namedColors from 'color-name-list'
import { PopupConn } from '../../../constants/settings'
import { Ring } from '../common/ring'

import styles from './style.module.css'

const backgroundScript = browser.runtime.connect({
  name: 'co.dothq.shield.ui.popup',
})

export class App extends Component {
  state = {
    ads: [],
  }

  componentDidMount() {
    backgroundScript.onMessage.addListener(async (msg: any) => {
      console.log(msg)

      if (msg.type === PopupConn.returnAds) {
        const blocked = msg.payload
        
        // Get current tab
        const tab = await browser.tabs.query({
          active: true,
          currentWindow: true,
        })
        const tabId = tab[0].id

        if (typeof blocked[tabId] !== 'undefined') {
          // Something has been blocked. Do something with the data
          const blockedURLs = blocked[tabId]
          
          this.setState({ ads: blockedURLs.map((url, i) => ({ label: url, value: 100/blockedURLs.length, color:  }))})
        }
      }
    })
    backgroundScript.postMessage({ type: PopupConn.getAds })
  }

  render() {
    return (
      <div className={styles.container}>
        <Ring
          data={this.state.ads}
          title={this.state.ads.length.toString()}
          subtitle="Blocked"
        />
      </div>
    )
  }
}
