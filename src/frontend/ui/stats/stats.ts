import Chart from 'chart.js'
import { StatsConn } from '../../../constants/settings'

import '../common/fonts.css'

const epocDate: any = new Date(new Date().getTime() / 1000)

const daysSinceEpoch = (date: any) =>
  Math.floor(Math.abs(date - epocDate) / 1000 / 86400)

const backgroundScript = browser.runtime.connect({
  name: 'co.dothq.shield.ui.stats',
})

const ctx = (document.getElementById(
  'blockedTime'
) as HTMLCanvasElement).getContext('2d')
const totalBlockedEl = document.getElementById('totalBlocked')

// TODO: Restyle stats page

// Load stats on receiving them
backgroundScript.onMessage.addListener((msg: any) => {
  if (msg.type == StatsConn.returnLT) {
    let data = []
    let labels = []
    let totalBlocked = 0

    const { payload } = msg
    for (const key in payload) {
      const daysEpoch = daysSinceEpoch(new Date(key))
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
            text: 'Chart.js Line Chart',
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
