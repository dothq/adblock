import React from 'react'
import { Loader } from 'react-feather'
import InlineSVG from 'svg-inline-react'

import { BackendState } from '../../../constants/state'
import { Switch, Button, Favicon } from '../common'
import { AppState } from './state'
import styles from './style.module.css'
import { getAppContrast, rgbaToHex } from './contrast'
import { Settings, Check, Forward } from '../assets/icons'

// =============================================================================
// Component types

type Props = {
  state: AppState
  setState: (state: AppState) => void
  toggleWhitelist: () => void
}

type Component = (arg0: Props) => JSX.Element

// =============================================================================
// Component

export const App: Component = ({ state, toggleWhitelist }) => {
  const textColor = getAppContrast(state.whitelisted, state.color)

  return (
    <div className={styles.container}>
      <main
        className={`${styles.accent} ${
          state.whitelisted ? styles.accentDisabled : ''
        }`}
        style={{ backgroundColor: rgbaToHex(state.color || 'white') }}
      >
        <div className={styles.itemBar}>
          <div style={{ justifyContent: 'flex-start' }}>
            <Switch
              state={!state.whitelisted}
              checkedColour={rgbaToHex(state.color || 'white')}
              backgroundColor={textColor}
              onChange={() => toggleWhitelist()}
            />
          </div>

          <div style={{ justifyContent: 'center' }}>
            <Favicon icon={state.favicon} />
          </div>

          <div style={{ justifyContent: 'flex-end' }}>
            <InlineSVG
              src={Settings}
              onClick={() => window.open('./settings.html')}
              style={{ width: '16px', fill: textColor, float: 'right' }}
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
          <div
            className={styles.info}
            style={{
              backgroundColor: 'var(--info)',
              border: '2px solid var(--info-border)',
              borderRadius: '4px',
              padding: 16,
            }}
          >
            <span>
              <Loader
                style={{
                  position: 'relative',
                  bottom: '-0.125em',
                  width: '1em',
                  height: '1em',
                }}
              />
              Ad blocker loading...
            </span>
          </div>
        )}

        <div className={styles.info}>
          <span>
            <i
              dangerouslySetInnerHTML={{ __html: Check }}
              style={{
                position: 'relative',
                bottom: '-0.125em',
                width: '1em',
                height: '1em',
                display: 'inline-block',
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
          <>
            View statistics{' '}
            <i
              dangerouslySetInnerHTML={{ __html: Forward }}
              style={{
                position: 'relative',
                bottom: '-0.125em',
                width: '1em',
                height: '1em',
                display: 'inline-block',
              }}
            />
          </>
        </Button>
      </div>
    </div>
  )
}
