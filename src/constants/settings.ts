export type SettingsStorage = {
  version: 1.1
  lists: {
    common: boolean
    fakeNews: boolean
    gambling: boolean
    social: boolean
    ipGrabbers: boolean
  }
}

export const DEFAULT_SETTINGS: SettingsStorage = {
  version: 1.1,
  lists: {
    common: true,
    fakeNews: false,
    gambling: false,
    social: false,
    ipGrabbers: false,
  },
}

export const LATEST_SETTINGS_VERSION = DEFAULT_SETTINGS.version
