import React from 'react'
import { ArrowRight, Check, Loader, Settings } from 'react-feather'
import ContrastColor from 'contrast-color'
import convert from 'color-convert'

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

type Component = (arg0: Props) => JSX.Element

const rgbaToRgb = (rgba: string) => {
  if (rgba.includes('rgb')) {
    const clean = rgba.replace('rgba(', '').replace(')', '')
    const asArray = clean.split(',').map((x) => parseInt(x))
    if (asArray.length == 4) {
      asArray.pop()
    }
    return `#${convert.rgb.hex(asArray as any)}`
  }

  return rgba
}

export const App: Component = ({ state, toggleWhitelist }) => {
  const accentDisabledColor = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--background-color-secondary')

  const contrastManager = new ContrastColor({
    bgColor: rgbaToRgb(state.color || 'white'),
    fgDarkColor: 'black',
    fgLightColor: 'white',
    defaultColor: 'red',
    threshold: 130,
  })

  const textColor = contrastManager.contrastColor({
    bgColor: state.whitelisted
      ? accentDisabledColor
      : rgbaToRgb(state.color || 'white'),
  })

  return (
    <div className={styles.container}>
      <main
        className={`${styles.accent} ${
          state.whitelisted ? styles.accentDisabled : ''
        }`}
        style={{ backgroundColor: rgbaToRgb(state.color || 'white') }}
      >
        <div className={styles.itemBar}>
          <div style={{ justifyContent: 'flex-start' }}>
            <Switch
              state={!state.whitelisted}
              checkedColour={rgbaToRgb(state.color || 'white')}
              backgroundColor={textColor}
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
          <>
            View statistics{' '}
            <ArrowRight
              style={{
                position: 'relative',
                bottom: '-0.125em',
                width: '1em',
                height: '1em',
              }}
            />
          </>
        </Button>
      </div>
    </div>
  )
}
