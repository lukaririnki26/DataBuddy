import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    toast: (type: ToastType, title: string, message?: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, type, title, message }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, [removeToast]);

    const value = {
        toast: addToast,
        success: (title: string, message?: string) => addToast('success', title, message),
        error: (title: string, message?: string) => addToast('error', title, message),
        info: (title: string, message?: string) => addToast('info', title, message),
        warning: (title: string, message?: string) => addToast('warning', title, message),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-0 right-0 p-6 z-[9999] flex flex-col gap-4 pointer-events-none w-full max-w-md">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className="pointer-events-auto animate-fadeInUp"
                    >
                        <ToastItem toast={t} onRemove={() => removeToast(t.id)} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    };

    const colors = {
        success: 'from-green-500/20 to-green-600/20 border-green-500/30',
        error: 'from-red-500/20 to-red-600/20 border-red-500/30',
        info: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
        warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    };

    return (
        <div className={`backdrop-blur-xl bg-gradient-to-br ${colors[toast.type]} border rounded-2xl p-4 shadow-2xl flex items-start gap-4 ring-1 ring-white/10 group overflow-hidden relative`}>
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${toast.type === 'success' ? 'from-green-400/10' : toast.type === 'error' ? 'from-red-400/10' : 'from-blue-400/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

            <div className="relative z-10 p-2">
                {icons[toast.type]}
            </div>
            <div className="flex-1 relative z-10 py-1">
                <h4 className="text-sm font-bold text-white leading-tight mb-1">{toast.title}</h4>
                {toast.message && <p className="text-xs text-slate-300 leading-relaxed font-medium">{toast.message}</p>}
            </div>
            <button
                onClick={onRemove}
                className="relative z-10 p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 animate-toastProgress"></div>
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
