import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0f',
            color: '#f0f0f8',
            fontFamily: 'monospace',
            padding: 32,
            gap: 16,
          }}
        >
          <h2 style={{ color: '#f87171', margin: 0 }}>Editor failed to load</h2>
          <pre
            style={{
              background: '#1a1a24',
              border: '1px solid #2a2a38',
              borderRadius: 8,
              padding: 16,
              maxWidth: 700,
              width: '100%',
              overflow: 'auto',
              fontSize: 12,
              color: '#fca5a5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
          <button
            style={{
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              cursor: 'pointer',
              fontSize: 14,
            }}
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
