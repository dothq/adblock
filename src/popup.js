import { Component, html } from 'https://unpkg.com/stera/dist/index.js'

class Main extends Component {
  constructor() {
    return { blocked: '-' }
  }

  render() {
    let template = html`<div>Blocked: ${this.state.blocked}</div>`

    return template
  }
}

customElements.define('app-main', Main)
