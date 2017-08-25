/**
 * @flow
 */

import React from 'react'
import { Action, merge } from '../microcosm'

/* istanbul ignore next */
const identity = () => {}

class ActionButton extends React.PureComponent {
  static defaultProps: Object

  send: Sender
  click: (event: Event) => Action

  constructor(props: Object, context: Object) {
    super(props, context)

    this.send = this.props.send || this.context.send
    this.click = this.click.bind(this)
  }

  click(event: Event): Action {
    let payload = this.props.prepare(this.props.value, event)
    let action = this.send(this.props.action, payload)

    if (action && action instanceof Action) {
      action
        .onOpen(this.props.onOpen)
        .onUpdate(this.props.onUpdate)
        .onCancel(this.props.onCancel)
        .onDone(this.props.onDone)
        .onError(this.props.onError)
    }

    if (this.props.onClick) {
      this.props.onClick(event, action)
    }

    return action
  }

  render() {
    const props = merge(this.props, { onClick: this.click })

    delete props.tag
    delete props.action
    delete props.value
    delete props.onOpen
    delete props.onDone
    delete props.onUpdate
    delete props.onCancel
    delete props.onError
    delete props.send
    delete props.prepare

    if (this.props.tag === 'button' && props.type == null) {
      props.type = 'button'
    }

    return React.createElement(this.props.tag, props)
  }
}

ActionButton.contextTypes = {
  send: identity
}

ActionButton.defaultProps = {
  tag: 'button',
  prepare: (value, event) => value
}

export default ActionButton
