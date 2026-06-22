import { Component } from "react";
import { Button } from "./ui";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 text-center">
          <p className="font-display text-2xl font-semibold text-ink mb-2">
            Something went wrong
          </p>
          <p className="text-sm text-ink-muted mb-6 max-w-sm">
            This page hit an unexpected error — it's usually fixed by reloading.
            If it keeps happening, check that the backend server is running.
          </p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
