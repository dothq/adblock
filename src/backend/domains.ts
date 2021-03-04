import { SHIELD_DB_ADS_AND_TRACKERS } from './constants/db'

export const getBlockedDomains = async (): Promise<string[]> => {
  // TODO [#14]: Implement caching system that stores blocklist inside of extention storage
  // TODO [#15]: Combine multiple blocklists

  const blockList = (await (await fetch(SHIELD_DB_ADS_AND_TRACKERS)).json())
    .blocked

  return blockList
}
