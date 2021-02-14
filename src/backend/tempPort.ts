const tempPort = (
  id: string,
  onInstance: (port: browser.runtime.Port) => void,
  setVar?: (val: browser.runtime.Port | undefined) => void
) => {
  const connected = (p: browser.runtime.Port) => {
    if (p.name === id) {
      if (setVar) setVar(p)
      onInstance(p)

      p.onDisconnect.addListener(() => setVar(undefined))
    }
  }

  browser.runtime.onConnect.addListener(connected)
}

export default tempPort
