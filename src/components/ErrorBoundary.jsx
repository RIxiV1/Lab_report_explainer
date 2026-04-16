import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <h2 className="font-serif text-[24px] font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
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
