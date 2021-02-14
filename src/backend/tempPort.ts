const tempPort = (
  id: string,
  setVar: (val: browser.runtime.Port | undefined) => void,
  onInstance: (port: browser.runtime.Port) => void
) => {
  const connected = (p: browser.runtime.Port) => {
    if (p.name === id) {
      setVar(p)
      onInstance(p)

      p.onDisconnect.addListener(() => setVar(undefined))
    }
  }

  browser.runtime.onConnect.addListener(connected)
}

export default tempPort
