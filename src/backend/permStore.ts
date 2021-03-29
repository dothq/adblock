export class PermStore<DataType> {
  private key: string
  protected memData: DataType
  protected loadingPromise: Promise<void>

  constructor(key: string, defaultData: DataType) {
    // Assign variable
    this.key = key

    // Load the data from storage
    this.loadingPromise = this.loadData(defaultData)
  }

  protected async loadData(defaultData: DataType) {
    const localStorage = await browser.storage.local.get()
    const data: any = localStorage[this.key]

    this.memData = (data as DataType) || defaultData
  }

  async storeData() {
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
    this.memData = data
    this.storeData()
  }
}
