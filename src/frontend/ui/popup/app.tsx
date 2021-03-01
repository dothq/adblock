import { Component } from 'react'
import DonutChart from 'react-donut-chart'
import { Ring } from '../common/ring'

import styles from './style.module.css'

export class App extends Component {
  render() {
    return (
      <div className={styles.container}>
        <Ring
          data={[
            {
              label: 'Give you up',
              value: 25,
            },
            {
              label: 'Let you down',
              value: 75,
              color: '#6fdb6f',
            },
          ]}
          title="0"
          subtitle="Blocked"
        />
      </div>
    )
  }
}
