import React from 'react'
import { ArrowRight, Check, Settings } from 'react-feather'
import { BackendState } from '../../../constants/state'
import { Switch, Button, Favicon } from '../common'
import { hexHSL } from './contrast'
import { AppState } from './state'
import styles from './style.module.css'

type Props = {
  state: AppState
  setState: (state: AppState) => void
  toggleWhitelist: () => void
}

type Component = (arg0: Props) => any

export const App: Component = ({ state, setState, toggleWhitelist }) => {
  const themeTextColor = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--color')

  const textColor = state.whitelisted
    ? themeTextColor
    : state.color.includes('#')
    ? hexHSL(state.color).l < 0.56
      ? '#fff'
      : '#000'
    : 'white'

  console.log(state.favicon)

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
              state={!state.whitelisted}
              checkedColour={state.color}
              onChange={() => toggleWhitelist()}
            />
          </div>

          <div style={{ justifyContent: 'center' }}>
            <Favicon icon={state.favicon} />
          </div>

          <div style={{ justifyContent: 'flex-end' }}>
            <Settings
              onClick={() => window.open('./settings.html')}
              style={{ width: '16px', color: textColor }}
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
        {state.backgroundState === BackendState.Loading && (
          <div>
            <p>The adblocker is currently loading...</p>
          </div>
        )}

        <div className={styles.info}>
          <span>
            <Check
              style={{
                position: 'relative',
                bottom: '-0.125em',
                width: '1em',
                height: '1em',
              }}
            />
            Total ads blocked
          </span>

          <span className={styles.infoText}>{state.totalBlocked}</span>
        </div>

        <Button
          onClick={() => window.open('./stats.html')}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
          }}
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
