import { SHIELD_DB_ADS_AND_TRACKERS } from './constants/db'

export const getBlockedDomains = async (): Promise<string[]> => {
  // Todo: Implement caching system that stores this inside of extension storage
  // Todo: Combine multiple block lists based on settings (upstream support required)

  const blockList = (await (await fetch(SHIELD_DB_ADS_AND_TRACKERS)).json())
    .blocked

  return blockList
}
