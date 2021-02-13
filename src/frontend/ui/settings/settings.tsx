import React from 'react'
import ReactDOM from 'react-dom'
import { Button, Checkbox } from '../common'

ReactDOM.render(
  <div>
    <h1>Dot Shield Settings</h1>

    <div>
      <Checkbox value={true} onChange={() => {}}>
        Common filter list
      </Checkbox>
      <Checkbox value={true} onChange={() => {}}>
        Fake news filter list
      </Checkbox>
      <Checkbox value={true} onChange={() => {}}>
        Gambling filter list
      </Checkbox>
      <Checkbox value={true} onChange={() => {}}>
        Social media filter list
      </Checkbox>
    </div>

    <Button>Save Settings</Button>
  </div>,
  document.getElementById('root')
)
