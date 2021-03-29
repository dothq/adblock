import { FiltersEngine } from '@cliqz/adblocker'

import {
  SHIELD_DB_ADS_AND_TRACKERS,
  SHIELD_DB_FAKE_NEWS,
  SHIELD_DB_GAMBLING,
  SHIELD_DB_SOCIAL,
  SHIELD_DB_IP_GRABBER,
} from './constants/db'

onmessage = async (settings) => {
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
  if (settings.data.lists.ipGrabber) {
    lists.push(SHIELD_DB_IP_GRABBER)
  }

  // Create a filter list using the cliqz filter engine
  const engine = await FiltersEngine.fromLists(fetch, lists)

  // Serialize the engine and send it back
  self.postMessage(engine.serialize())
}
