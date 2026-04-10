import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              We hit an unexpected error while processing your report. Your data is still saved on this device.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-6 py-3"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
