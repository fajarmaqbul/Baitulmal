import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-background rounded-xl border border-border shadow-sm m-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Waduh, Ada Masalah Teknis!</h1>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        Mohon maaf, terjadi kesalahan saat memuat halaman ini. Jangan panik, data Anda tetap aman.
                    </p>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="w-full max-w-2xl bg-slate-950 p-4 rounded-lg mb-8 text-left overflow-auto border border-slate-800">
                            <code className="text-red-400 text-sm whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={this.handleReset}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-semibold"
                        >
                            <RotateCcw size={18} /> Coba Segarkan
                        </button>
                        <a
                            href="/"
                            className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-all font-semibold border border-border"
                        >
                            <Home size={18} /> Balik ke Home
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
