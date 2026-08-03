import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp, ShieldAlert, Trash2 } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[Application Error Boundary caught crash]:", error, errorInfo);

    // Send error report to server telemetry endpoint
    try {
      const payload = JSON.stringify({
        message: error.message || "Unknown client runtime crash",
        name: error.name || "Error",
        stack: error.stack || "",
        componentStack: errorInfo.componentStack || "",
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/telemetry/errors", payload);
      } else {
        fetch("/api/telemetry/errors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {
      // Fail safely
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/";
  };

  private handleClearStorageAndReload = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem("nutriglobe_cache");
    } catch (e) {
      // ignore
    }
    this.handleReset();
  };

  private handleCopy = () => {
    const { error, errorInfo } = this.state;
    const text = `Error: ${error?.name}: ${error?.message}\n\nStack:\n${error?.stack}\n\nComponent Stack:\n${errorInfo?.componentStack}`;
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-emerald-500 selection:text-slate-900">
          <div className="max-w-2xl w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Header Icon */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/60">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Application Exception Shield
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  An unexpected error occurred in the component tree. The application was safely protected from crashing completely.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-red-200">
                    {this.state.error?.name || "Runtime Exception"}
                  </h2>
                  <p className="text-xs sm:text-sm text-red-300/90 font-mono break-all">
                    {this.state.error?.message || "An unknown runtime exception occurred."}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/20"
              >
                <RefreshCw className="w-4 h-4" />
                Reload App
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl text-sm transition-all"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </button>

              <button
                onClick={this.handleClearStorageAndReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-all"
                title="Clears local cache and reloads page"
              >
                <Trash2 className="w-4 h-4 text-amber-400" />
                Reset Local Cache
              </button>
            </div>

            {/* Diagnostics Accordion */}
            <div className="border border-slate-700/60 rounded-xl overflow-hidden bg-slate-900/50">
              <button
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                className="w-full flex items-center justify-between p-3.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>Stack Trace & Diagnostics</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                    Telemetry Captured
                  </span>
                </span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="p-4 border-t border-slate-700/60 bg-slate-950/80 space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={this.handleCopy}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                    >
                      {this.state.copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Diagnostics</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Component Call Stack
                    </h4>
                    <pre className="text-[11px] text-slate-300 font-mono bg-slate-900 p-3 rounded-lg overflow-x-auto border border-slate-800 max-h-48 whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack || "No component stack available."}
                    </pre>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      JavaScript Error Stack
                    </h4>
                    <pre className="text-[11px] text-slate-400 font-mono bg-slate-900 p-3 rounded-lg overflow-x-auto border border-slate-800 max-h-48 whitespace-pre-wrap">
                      {this.state.error?.stack || "No error stack available."}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-slate-500">
              NutriGlobe Enterprise Resiliency System &bull; Automatic Error Telemetry Active
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
