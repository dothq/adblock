import {
  DEFAULT_SETTINGS,
  LATEST_SETTINGS_VERSION,
  SettingsStorage,
} from '../constants/settings'
import { PermStore } from './permStore'

export class Setting extends PermStore<SettingsStorage> {
  constructor() {
    super('settings', DEFAULT_SETTINGS)
  }

  protected async loadData(defaultData: SettingsStorage) {
    await super.loadData(defaultData)

    // Update settings if it is outdated
    if (this.data.version < LATEST_SETTINGS_VERSION) {
      this.data = { ...this.data, ...DEFAULT_SETTINGS }
      this.data.version = LATEST_SETTINGS_VERSION
    }
  }
}
