import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "12px", border: "1px solid #f87171", margin: "2rem" }}>
          <h2 style={{ marginTop: 0 }}>¡Ups! Ocurrió un error en esta sección</h2>
          <p style={{ fontWeight: "bold" }}>{this.state.error && this.state.error.toString()}</p>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem", backgroundColor: "white", padding: "1rem", borderRadius: "8px", overflowX: "auto" }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
