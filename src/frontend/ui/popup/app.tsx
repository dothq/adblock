import React from 'react'
import { ArrowRight, Settings } from 'react-feather'
import { Switch, Button, Favicon } from '../common'
import { hexHSL } from './contrast'
import styles from './style.module.css'

export const App = ({ state, setState, toggleWhitelist }) => {
  const themeTextColor = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--color')

  const textColor = state.whitelist
    ? themeTextColor
    : state.color.includes('#')
    ? hexHSL(state.color).l < 0.56
      ? '#fff'
      : '#000'
    : 'white'

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
              state={state.whitelisted}
              checkedColour={'#b80000'}
              onChange={() => toggleWhitelist()}
            />
          </div>

          <div style={{ justifyContent: 'center' }}>
            <Favicon icon={state.favicon} />
          </div>

          <div style={{ justifyContent: 'flex-end' }}>
            <Settings
              onClick={() => window.open('./settings.html')}
              style={{ width: '16px' }}
            />
          </div>
        </div>

        <div
          className={styles.center}
          style={{ textAlign: 'center', color: textColor }}
        >
          <h1>{state.blocked}</h1>
          <p>Ads or trackers blocked</p>
        </div>
      </main>
      <div className={styles.controls}>
        <Button
          onClick={() => window.open('./stats.html')}
          style={{ backgroundColor: 'transparent' }}
        >
          View statistics{' '}
          <ArrowRight
            style={{
              position: 'relative',
              bottom: '-0.125em',
              width: '1em',
              height: '1em',
            }}
          />
        </Button>
      </div>
    </div>
  )
}
