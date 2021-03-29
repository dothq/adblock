export type SettingsStorage = {
  version: number
  lists: {
    common: boolean
    fakeNews: boolean
    gambling: boolean
    social: boolean
  }
}

export const DEFAULT_SETTINGS: SettingsStorage = {
  version: 1,
  lists: {
    common: true,
    fakeNews: false,
    gambling: false,
    social: false,
  },
}

export const LATEST_SETTINGS_VERSION = DEFAULT_SETTINGS.version
