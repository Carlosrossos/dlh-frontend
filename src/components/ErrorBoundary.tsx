import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
          }}>
            🏔️
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            color: '#333',
            marginBottom: '0.5rem',
          }}>
            Oups, une erreur est survenue
          </h1>
          <p style={{
            color: '#666',
            marginBottom: '2rem',
            maxWidth: '400px',
          }}>
            Nous sommes désolés, quelque chose s'est mal passé. 
            Veuillez recharger la page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              backgroundColor: '#d4a574',
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Retour à l'accueil
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#fee',
              borderRadius: '8px',
              fontSize: '0.75rem',
              textAlign: 'left',
              maxWidth: '600px',
              overflow: 'auto',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
