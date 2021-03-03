export const DEFAULT_SETTINGS = {
  version: 1,
  lists: {
    common: true,
    fakeNews: true,
    gambling: true,
    social: true,
  },
}

export const LATEST_SETTINGS_VERSION = DEFAULT_SETTINGS.version

export enum SettingsConn {
  reload = 'type.reload',
}

export enum PopupConn {
  // Get the ads blocked
  getAds = 'type.getAds',
  returnAds = 'type.returnAds',

  // Whitelist management
  addWhitelist = 'type.addWhitelist',
  removeWhitelist = 'type.removeWhitelist',
  getWhitelist = 'type.getWhitelist',
  returnWhitelist = 'type.returnWhitelist',
}
