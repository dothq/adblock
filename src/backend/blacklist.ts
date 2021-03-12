import { SHIELD_DB_ADS_AND_TRACKERS } from './constants/db'
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

  cacheHandler(callback: () => void) {
    ;(async () => {
      if (this.blacklistExpiry.data < new Date()) {
        console.log('Downloading blacklist from shieldDB...')

        // TODO [#15]: Combine multiple blocklists
        // TODO: Add CNAME filters to the blacklist
        // TODO Note: https://github.com/AdguardTeam/cname-trackers

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
