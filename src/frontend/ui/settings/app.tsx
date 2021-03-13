/// <reference types="web-ext-types"/>

import React, { Component } from 'react'

import { DEFAULT_SETTINGS, SettingsConn } from '../../../constants/settings'
import { Button, Checkbox } from '../common'
import styles from './settings.module.css'

// Connect to the background script
const backgroundScript = browser.runtime.connect({
  name: 'co.dothq.shield.ui.settings',
})

interface AppState {
  settings?: any
}

class SettingsApp extends Component<AppState> {
  state: AppState = {}

  componentDidMount() {
    this.fetchSettings()
  }

  /**
   * Retrieve extension information in an async manner
   *
   * @memberof SettingsApp
   */
  async fetchSettings() {
    let settings = (await browser.storage.local.get('settings')).settings || {}

    // Check if settings exists
    if (JSON.stringify(settings) == '{}') {
      console.log('Setting settings to default')
      settings = DEFAULT_SETTINGS
      await browser.storage.local.remove('settings')
      await browser.storage.local.set({ settings })
    }

    console.log(JSON.stringify(settings))

    this.setState({ settings })
  }

  render() {
    let settings = this.state.settings

    return (
      <div className={styles.page}>
        <h1>Dot Shield Settings</h1>

        {settings && (
          <>
            <h2>Filter lists</h2>
            <div>
              <Checkbox
                value={settings.lists.common}
                onChange={() => {
                  settings.lists.common = !settings.lists.common
                  this.setState({ settings })
                }}
              >
                Common filter list
              </Checkbox>
              <Checkbox
                value={settings.lists.fakeNews}
                onChange={() => {
                  settings.lists.fakeNews = !settings.lists.fakeNews
                  this.setState({ settings })
                }}
              >
                Fake news filter list
              </Checkbox>
              <Checkbox
                value={settings.lists.gambling}
                onChange={() => {
                  settings.lists.gambling = !settings.lists.gambling
                  this.setState({ settings })
                }}
              >
                Gambling filter list
              </Checkbox>
              <Checkbox
                value={settings.lists.social}
                onChange={() => {
                  settings.lists.social = !settings.lists.social
                  this.setState({ settings })
                }}
              >
                Social media filter list
              </Checkbox>
            </div>

            <Button
              onClick={async () => {
                await browser.storage.local.remove('settings')
                await browser.storage.local.set({ settings })
                backgroundScript.postMessage({ type: SettingsConn.reload })
              }}
            >
              Save Settings
            </Button>
          </>
        )}
      </div>
    )
  }
}

export default SettingsApp
