import React, { useEffect } from 'react';
import api from './api';

export const sendLog = async (level: 'info' | 'warn' | 'error', message: string, component: string, details?: any) => {
    // Only log to console in dev, but always try to send to backend for tracking (or configure based on env)
    console.log(`[${component}] ${message}`, details || '');

    try {
        await api.post('/logs', {
            level,
            message,
            component,
            details
        });
    } catch (err) {
        // Prevent infinite loops if logging fails
        console.error('Failed to send log to backend', err);
    }
};

export function withLogger<P extends object>(WrappedComponent: React.ComponentType<P>, componentName: string) {
    const WithLogger = (props: P) => {
        useEffect(() => {
            sendLog('info', 'Mounted', componentName);
            return () => {
                sendLog('info', 'Unmounted', componentName);
            };
        }, []);

        useEffect(() => {
            // We won't send "Updated" logs to backend to avoid spam, just console
            if (process.env.NODE_ENV === 'development') {
                console.log(`[${componentName}] Updated`);
            }
        });

        // Error boundary-like logging could go here if we wrapped in an ErrorBoundary

        return <WrappedComponent {...props} />;
    };

    WithLogger.displayName = `WithLogger(${componentName})`;
    return WithLogger;
}
