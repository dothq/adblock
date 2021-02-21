export const getBlockedDomains = async (): Promise<string[]> => {
  // Todo: Implement caching system that stores this inside of extension storage
  // Todo: Combine multiple block lists based on settings (upstream support required)

  const blockList = (
    await (
      await fetch(
        'https://cdn.statically.io/gh/dothq/shield-db/main/adsAndTrackers.json'
      )
    ).json()
  ).blocked

  return blockList
}
