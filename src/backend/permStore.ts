export class PermStore<DataType> {
  key: string
  memData: DataType
  loadingPromise: Promise<void>

  constructor(key: string, defaultData: DataType) {
    // Assign variable
    this.key = key

    // Load the data from storage
    this.loadingPromise = this.loadData(defaultData)
  }

  private async loadData(defaultData: DataType) {
    const localStorage = await browser.storage.local.get()
    let data = JSON.parse(localStorage[this.key] as string)

    if (typeof data === 'undefined') {
      data = defaultData
    }

    this.data = data
  }

  private async storeData() {
    const storageQuery = {}
    storageQuery[this.key] = this.data
    await browser.storage.local.set(storageQuery)
  }

  async load() {
    await this.loadingPromise
  }

  get data() {
    return this.memData
  }

  set data(data: DataType) {
    this.data = data
    this.storeData()
  }
}
