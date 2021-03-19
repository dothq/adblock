import { v4 as uuidv4 } from 'uuid'

import tempPort from '../tempPort'

type CallFunctionData = {
  name: string,
  payload?: any
  id: string
}
type FunctionReturnData = {

}

let functions: { name: string; callback: (payload: any) => any }[] = []

tempPort('co.dothq.shield.fn', (p) =>
  p.onMessage.addListener((msg: any) => {})
)

export const remoteFn = (name: string, payload: any): Promise<any> => {
  const backend = browser.runtime.connect({
    name: 'co.dothq.shield.fn',
  })

  backend.onMessage.addListener((msg: any))
}

export const registerFn = (name: string, callback: (payload: any) => any) => {
  functions.push({ name, callback })
}
