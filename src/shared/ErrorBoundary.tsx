import { Component } from 'react'
import type { ReactNode } from 'react'

type Props = {
  // Rendered when a child throws; `reset` clears the error to retry.
  fallback: (reset: () => void) => ReactNode
  // When any value here changes, the boundary auto-clears (e.g. a fresh URL).
  resetKeys?: unknown[]
  children: ReactNode
}
type State = { error: Error | null }

const keysChanged = (a?: unknown[], b?: unknown[]) => {
  if (a === b) return false
  if (!a || !b || a.length !== b.length) return true
  return a.some((v, i) => !Object.is(v, b[i]))
}

// Minimal reusable error boundary. React error boundaries must be class
// components; this one supports a render-prop fallback and resetKeys.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && keysChanged(prev.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null })
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) return this.props.fallback(this.reset)
    return this.props.children
  }
}
