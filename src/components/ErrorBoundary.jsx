import React from 'react';
import Icons from './icons';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full h-full bg-slate-900/80 border border-red-500/50 rounded-xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm font-mono">
          <Icons.ShieldAlert className="text-red-500 w-12 h-12 mb-3 animate-pulse" />
          <h3 className="text-md font-bold text-red-500 uppercase tracking-widest mb-1">Component Crash Caught</h3>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            An error occurred while rendering this interface component.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-1.5 px-4 rounded text-[10px] transition-colors uppercase"
          >
            Retry Render
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
