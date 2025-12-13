'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/src/context/AuthContext";
import { useState, useEffect } from 'react';
import { sendLog } from '@/src/lib/withLogger';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }));

    useEffect(() => {
        // Log when the app provider mounts (first load)
        sendLog('info', 'Application Mounted', 'Providers');

        // Optional error handler for unhandled promise rejections
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            sendLog('error', 'Unhandled Promise Rejection', 'Global', { reason: event.reason });
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Toaster richColors position="top-right" />
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    );
}
