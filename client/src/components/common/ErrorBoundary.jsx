import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button.jsx';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Exception caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6">
          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-rose-500/30 max-w-lg w-full text-center shadow-glass backdrop-blur-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6 shadow-glow-rose">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              An unexpected interface exception occurred. You can reload this view or return to the platform home.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                icon={RefreshCw}
                className="w-full sm:w-auto shadow-glow-indigo"
              >
                Reload View
              </Button>

              <a href="/" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="md"
                  icon={Home}
                  className="w-full sm:w-auto"
                >
                  Return Home
                </Button>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
