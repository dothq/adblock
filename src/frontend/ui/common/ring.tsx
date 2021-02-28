import { useState } from 'react'
import style from './ring.module.css'

const SIZE = 232
const STROKE_WIDTH = 24
const STROKE_ARRAY = Math.round(SIZE * 2.7)
console.log(STROKE_ARRAY)

const ringStyles = (percentage: number, prior: number): string => {
  return `
    stroke-dasharray: ${STROKE_ARRAY};
    stroke-dashoffset: ${Math.round(STROKE_ARRAY * (percentage / 100))};
    transform-origin: ${SIZE / 2}px ${SIZE / 2}px;
    transform: rotate(${-(360 * (prior / 100) + 90)}deg)
  `
}

export const Ring: (props: {
  data: { label: string; value: number; color?: string }[]
}) => any = ({ data }) => {
  let totalRotation = 0

  return (
    <div style={{ width: '100%' }}>
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

      <div style={{ position: 'relative' }}>
        {data.map((ring, i) => {
          const [hover, setHover] = useState(false)

          return (
            <div
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                margin: '0 auto',
              }}
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
                      onMouseEnter={() => setHover(true)}
                      onMouseLeave={() => setHover(false)}
                    />
                  </g>
                </svg>
                <div
                  className={style.dropdownContent}
                  style={{ display: hover ? 'block' : 'none' }}
                >
                  <p>{ring.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
