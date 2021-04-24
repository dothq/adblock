import { FiltersEngine } from '@cliqz/adblocker'

import {
  SHIELD_DB_ADS_AND_TRACKERS,
  SHIELD_DB_FAKE_NEWS,
  SHIELD_DB_GAMBLING,
  SHIELD_DB_SOCIAL,
  SHIELD_DB_IP_GRABBER,
} from './constants/db'

async function createEngine(name, list) {
  return {
    name,
    engine: await FiltersEngine.fromLists(fetch, [list])
  }
}

onmessage = async (settings) => {
  const engines = []

  engines.push(await createEngine('Common', SHIELD_DB_ADS_AND_TRACKERS))

  // Add each list if selected
  if (settings.data.lists.fakeNews) {
    engines.push(await createEngine('Fake news', SHIELD_DB_FAKE_NEWS))
  }
  if (settings.data.lists.gambling) {
    engines.push(await createEngine('Gambling', SHIELD_DB_GAMBLING))
    
  }
  if (settings.data.lists.social) {
    engines.push(await createEngine('Social', SHIELD_DB_SOCIAL))
    
  }
  if (settings.data.lists.ipGrabber) {
    engines.push(await createEngine('IP Grabbers', SHIELD_DB_IP_GRABBER))
  }

  // Serialize the engine and send it back
  postMessage(engines.map(engine => ({ name: engine.name, engine: engine.engine.serialize() })))
}
