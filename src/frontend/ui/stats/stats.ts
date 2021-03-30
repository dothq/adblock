import Chart from 'chart.js'
import { remoteFn } from '../../../backend/lib/remoteFunctions'

import '../common/common.css'

// Set the default color
Chart.defaults.global.defaultFontColor = getComputedStyle(
  document.documentElement
).getPropertyValue('--color')

// Get the canvas context that will be used to draw the chart
const ctx = (document.getElementById(
  'blockedTime'
) as HTMLCanvasElement).getContext('2d')

// Get all of the text elements that need to be updated
const totalBlockedEl = document.getElementById('totalBlocked')

;(async () => {
  const payload = await remoteFn('getLongTermStats')

  const data = []
  const labels = []
  let totalBlocked = 0

  for (const key in payload) {
    const blocked = payload[key]
    totalBlocked += blocked

    data.push({ x: new Date(key), y: blocked })
    labels.push(key)
  }

  totalBlockedEl.innerText = totalBlocked.toString()

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          backgroundColor: '#256ef5',
          borderColor: '#256ef5',
          fill: true,
          label: 'Blocked websites',
          data,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Blocked sources',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      hover: {
        mode: 'nearest',
        intersect: true,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Month',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Value',
          },
        },
      },
    },
  })
})()
