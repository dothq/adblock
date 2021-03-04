import { useState } from 'react'
import style from './ring.module.css'

const SIZE = 232
const STROKE_WIDTH = 24
const STROKE_ARRAY = Math.round(SIZE * 2.7)

const ringStyles = (percentage: number, prior: number): string => {
  return `
    stroke-dasharray: ${STROKE_ARRAY};
    stroke-dashoffset: ${Math.round(STROKE_ARRAY * ((100 - percentage) / 100))};
    transform-origin: ${SIZE / 2}px ${SIZE / 2}px;
    transform: rotate(${-(360 * ((prior + percentage) / 100))}deg)
  `
}

export const Ring: (props: {
  data: { label: string; value: number; color?: string }[]
  title: string
  subtitle: string
}) => any = ({ data, title, subtitle }) => {
  let totalRotation = 0
  const [hover, setHover] = useState({})
  const [forceState, setForceState] = useState(false)
  const forceRender = () => setForceState(!forceState)

  return (
    <div style={{ width: '100%', height: SIZE, position: 'relative' }}>
      <style>
        {data.map((ring, i) => {
          const elStyle = `
            #${style.ring}-${i} {
              ${ringStyles(ring.value, totalRotation)}
            }
          `

          totalRotation += ring.value
          return elStyle
        })}
      </style>

      <div
        style={{
          position: 'relative',
          // width: '100%',
          height: '100%',
        }}
      >
        {data.map((ring, i) => {
          // const [hover, setHover] = useState(false)

          const setLocalHover = (bool) => {
            hover[i] = bool
            setHover(hover)
            forceRender()
          }

          if (typeof hover[i] === 'undefined') {
            hover[i] = false
            setHover(hover)
            forceRender()
          }

          return (
            <div
              style={{
                position: 'absolute',
                pointerEvents: 'none',
              }}
              className={style.center}
              key={i}
            >
              <div className={style.dropdown}>
                <svg
                  style={{
                    height: SIZE,
                    width: SIZE,
                  }}
                >
                  <g>
                    <circle
                      className={style.ring}
                      id={`${style.ring}-${i}`}
                      style={{ pointerEvents: 'auto' }}
                      r={SIZE / 2 - STROKE_WIDTH}
                      cy={SIZE / 2}
                      cx={SIZE / 2}
                      strokeWidth={STROKE_WIDTH}
                      stroke={ring.color || '#69aff4'}
                      fill="none"
                      onMouseEnter={() => setLocalHover(true)}
                      onMouseLeave={() => setLocalHover(false)}
                    />
                  </g>
                </svg>
                <div
                  className={style.dropdownContent}
                  style={{ display: hover[i] ? 'block' : 'none' }}
                >
                  <p>{ring.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className={style.center}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}
