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
  getAds = 'type.getAds',
  returnAds = 'type.returnAds',
}
