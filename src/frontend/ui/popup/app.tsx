import React from 'react'
import { remoteFn } from '../../../backend/lib/remoteFunctions'
import { Switch, Button, Favicon } from '../common'
import styles from './style.module.css'

export const App = ({ state, setState, toggleWhitelist }) => {
  console.log(state.color)

  return (
    <div className={styles.container}>
      <main
        className={`${styles.accent} ${
          state.whitelisted ? styles.accentDisabled : ''
        }`}
        style={{ backgroundColor: state.color }}
      >
        <div className={styles.itemBar}>
          <div style={{ justifyContent: 'flex-start' }}>
            <Switch
              defaultState={state.whitelisted}
              checkedColour={'#b80000'}
              onChange={() => toggleWhitelist()}
            />
          </div>

          <div style={{ justifyContent: 'center' }}>
            <Favicon icon={state.favicon} />
          </div>

          <div style={{ justifyContent: 'flex-end' }}>
            <Switch
              defaultState={false}
              checkedColour={'#b80000'}
              onChange={() => toggleWhitelist()}
            />
          </div>
        </div>
      </main>
      <div className={styles.controls}>
        <Button
          isPrimary={true}
          onClick={() => toggleWhitelist()}
          className={styles.controlDouble}
        >
          {state.whitelisted ? 'Block' : 'Allow'} ads and trackers on this site
        </Button>
        <Button onClick={() => window.open('./stats.html')}>
          View statistics
        </Button>
        <Button onClick={() => window.open('./settings.html')}>Settings</Button>
      </div>
    </div>
  )
}
