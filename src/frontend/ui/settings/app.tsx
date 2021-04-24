/// <reference types="web-ext-types"/>

import React, { Component } from 'react'
import { remoteFn } from '../../../backend/lib/remoteFunctions'

import { DEFAULT_SETTINGS, SettingsStorage } from '../../../constants/settings'
import { Button, Checkbox } from '../common'
import styles from './settings.module.css'

interface AppState {
  settings?: SettingsStorage
  hasChanged: boolean
}

class SettingsApp extends Component {
  state: AppState = { hasChanged: false }

  componentDidMount(): void {
    this.fetchSettings()
  }

  /**
   * Retrieve extension information in an async manner
   *
   * @memberof SettingsApp
   */
  async fetchSettings(): Promise<void> {
    let settings = (await browser.storage.local.get('settings')).settings || {}

    // Check if settings exists
    if (JSON.stringify(settings) == '{}') {
      settings = DEFAULT_SETTINGS
      await browser.storage.local.remove('settings')
      await browser.storage.local.set({ settings })
    }

    this.setState({ hasChanged: this.state.hasChanged, settings })
  }

  render(): JSX.Element {
    const settings: SettingsStorage = this.state.settings

    return (
      <div className={styles.page}>
        <h1>Dot Shield Settings</h1>

        {settings && (
          <>
            <div style={{ marginBottom: 16 }}>
            <Checkbox
                value={settings.enabled}
                onChange={() => {
                  settings.enabled = !settings.enabled
                  this.setState({ hasChanged: true, settings })
                }}
              >
                <>Enabled</>
              </Checkbox>
            </div>

            <h2>Filter lists</h2>
            <div style={{ marginBottom: 16 }}>
              <Checkbox
                value={settings.lists.fakeNews}
                onChange={() => {
                  settings.lists.fakeNews = !settings.lists.fakeNews
                  this.setState({ hasChanged: true, settings })
                }}
              >
                <>Fake news filter list</>
              </Checkbox>
              <Checkbox
                value={settings.lists.gambling}
                onChange={() => {
                  settings.lists.gambling = !settings.lists.gambling
                  this.setState({ hasChanged: true, settings })
                }}
              >
                <>Gambling filter list</>
              </Checkbox>
              <Checkbox
                value={settings.lists.social}
                onChange={() => {
                  settings.lists.social = !settings.lists.social
                  this.setState({ hasChanged: true, settings })
                }}
              >
                <>Social media filter list</>
              </Checkbox>
              <Checkbox
                value={settings.lists.ipGrabbers}
                onChange={() => {
                  settings.lists.ipGrabbers = !settings.lists.ipGrabbers
                  this.setState({ hasChanged: true, settings })
                }}
              >
                <>IP Grabbers filter list</>
              </Checkbox>
            </div>

            <Button
              onClick={async () => {
                await browser.storage.local.remove('settings')
                await browser.storage.local.set({ settings })
                await remoteFn('reloadBackend')
                this.setState({ ...this.state, hasChanged: false })
              }}
              disabled={!this.state.hasChanged}
            >
              <>Save Settings</>
            </Button>
          </>
        )}
      </div>
    )
  }
}

export default SettingsApp
