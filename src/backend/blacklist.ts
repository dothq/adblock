import { SHIELD_DB_ADS_AND_TRACKERS } from './constants/db'
import { PermStore } from './permStore'

export type BlacklistData = string[]

export class Blacklist {
  loadingPromise: Promise<void>

  blacklistCache: PermStore<BlacklistData>
  blacklistExpiry: PermStore<Date>

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
    await this.blacklistCache.load()
    await this.blacklistExpiry.load()

    console.log('Loading cached blacklist...')
    this.blacklist = this.blacklistCache.data
  }

  cacheHandler(callback: () => void) {
    ;(async () => {
      if (this.blacklistExpiry.data < new Date()) {
        console.log('Downloading blacklist from shieldDB...')

        // TODO [#15]: Combine multiple blocklists

        const blockList = (
          await (await fetch(SHIELD_DB_ADS_AND_TRACKERS)).json()
        ).blocked

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
