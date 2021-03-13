import Chart from 'chart.js'
import { StatsConn } from '../../../constants/settings'

import '../common/common.css'

// Set the default color
Chart.defaults.global.defaultFontColor = getComputedStyle(
  document.documentElement
).getPropertyValue('--color')

const backgroundScript = browser.runtime.connect({
  name: 'co.dothq.shield.ui.stats',
})

const ctx = (document.getElementById(
  'blockedTime'
) as HTMLCanvasElement).getContext('2d')
const totalBlockedEl = document.getElementById('totalBlocked')

// Load stats on receiving them
backgroundScript.onMessage.addListener((msg: any) => {
  if (msg.type == StatsConn.returnLT) {
    let data = []
    let labels = []
    let totalBlocked = 0

    const { payload } = msg
    for (const key in payload) {
      const blocked = payload[key]
      totalBlocked += blocked

      data.push({ x: new Date(key), y: blocked })
      labels.push(key)
    }

    totalBlockedEl.innerText = totalBlocked.toString()

    console.log(data)

    const myChart = new Chart(ctx, {
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
  }
})

backgroundScript.postMessage({ type: StatsConn.getLT })
