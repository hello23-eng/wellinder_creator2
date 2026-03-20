import * as React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const state = this.state as ErrorBoundaryState;
    if (state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F4] p-6 text-center">
          <div className="max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-serif mb-2">Something went wrong</h1>
            <p className="text-[#1A1A1A]/60 mb-6">
              {state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1A1A1A] text-white px-8 py-3 rounded-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return (this.props as ErrorBoundaryProps).children;
  }
}
