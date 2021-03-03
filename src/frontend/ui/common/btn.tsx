import { Component } from 'react'
import { PopupConn } from '../../../constants/settings'

import buttonStyle from '../common/btn.module.css'

interface Props {
  children: any
  isPrimary: boolean
}

export class Button extends Component<Props> {
  state = {
    whitelisted: false,
    init: false,
  }

  componentDidMount() {}

  render() {
    return (
      <button
        className={`${buttonStyle.btn} ${
          this.props.isPrimary ? buttonStyle.primary : buttonStyle.secondary
        }`}
      >
        {this.props.children}
      </button>
    )
  }
}
