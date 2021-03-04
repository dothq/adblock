import { SHIELD_DB_ADS_AND_TRACKERS } from './constants/db'

export const getBlockedDomains = async (): Promise<string[]> => {
  // TODO [$604080d075cb1c0008baf2f3]: Implement caching system that stores blocklist inside of extention storage
  // TODO [$604080d075cb1c0008baf2f4]: Combine multiple blocklists

  const blockList = (await (await fetch(SHIELD_DB_ADS_AND_TRACKERS)).json())
    .blocked

  return blockList
}
