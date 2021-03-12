import { SettingsStorage } from '../constants/settings'
import {
  SHIELD_DB_ADS_AND_TRACKERS,
  SHIELD_DB_FAKE_NEWS,
  SHIELD_DB_GAMBLING,
  SHIELD_DB_SOCIAL,
} from './constants/db'
import { PermStore } from './permStore'

export type BlacklistData = string[]

export class Blacklist {
  private loadingPromise: Promise<void>

  private blacklistCache: PermStore<BlacklistData>
  private blacklistExpiry: PermStore<Date>

  blacklist: string[] = []

  constructor() {
    // Initialize variables
    this.blacklistCache = new PermStore('blacklistCache', [
      '*://*.doubleclick.net/',
    ])
    this.blacklistExpiry = new PermStore(
      'blacklistExpiry',
      new Date('1:1 1/1/2000')
    )

    // Start loading the cache from storage
    this.loadingPromise = this.loadData()
  }

  private async loadData() {
    console.log('Loading cached blacklist...')
    console.time('Loading cached blacklist')

    await this.blacklistCache.load()
    await this.blacklistExpiry.load()

    this.blacklist = this.blacklistCache.data
    console.timeEnd('Loading cached blacklist')
  }

  cacheHandler(settings: SettingsStorage, callback: () => void) {
    ;(async () => {
      if (this.blacklistExpiry.data < new Date()) {
        console.log('Downloading blacklist from shieldDB...')

        let blockList = []

        if (settings.lists.common) {
          const commonList = (
            await (await fetch(SHIELD_DB_ADS_AND_TRACKERS)).json()
          ).blocked

          blockList = [...blockList, ...commonList]
        }

        if (settings.lists.fakeNews) {
          const fakeNewsList = (await (await fetch(SHIELD_DB_FAKE_NEWS)).json())
            .blocked

          blockList = [...blockList, ...fakeNewsList]
        }

        if (settings.lists.gambling) {
          const gambling = (await (await fetch(SHIELD_DB_GAMBLING)).json())
            .blocked

          blockList = [...blockList, ...gambling]
        }

        if (settings.lists.social) {
          const social = (await (await fetch(SHIELD_DB_SOCIAL)).json()).blocked

          blockList = [...blockList, ...social]
        }

        let cacheExpiry = new Date()
        cacheExpiry.setDate(cacheExpiry.getDate() + 1) // Expires in 1 days time

        this.blacklistCache.data = blockList
        this.blacklistExpiry.data = cacheExpiry
        this.blacklist = this.blacklistCache.data

        console.log('Download complete')

        callback()
      }
    })()
  }

  async load() {
    await this.loadingPromise
  }
}
