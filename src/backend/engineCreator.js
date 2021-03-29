import { FiltersEngine } from '@cliqz/adblocker'

import {
  SHIELD_DB_ADS_AND_TRACKERS,
  SHIELD_DB_FAKE_NEWS,
  SHIELD_DB_GAMBLING,
  SHIELD_DB_SOCIAL,
} from './constants/db'

onmessage = async (settings) => {
  console.log('worker')

  // Create what lists should be loaded
  const lists = [SHIELD_DB_ADS_AND_TRACKERS]

  // Add each list if selected
  if (settings.data.lists.fakeNews) {
    lists.push(SHIELD_DB_FAKE_NEWS)
  }
  if (settings.data.lists.gambling) {
    lists.push(SHIELD_DB_GAMBLING)
  }
  if (settings.data.lists.social) {
    lists.push(SHIELD_DB_SOCIAL)
  }

  // Create a filter list using the cliqz filter engine
  // TODO [#33]: Test if moving this into a webworker reduces addon load interruptions
  const engine = await FiltersEngine.fromLists(fetch, lists)

  console.log('test')

  self.postMessage(engine.serialize())
}
