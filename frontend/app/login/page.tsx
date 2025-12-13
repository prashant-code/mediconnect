"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/lib/api';
import Link from 'next/link';
import { Heart, Lock, Mail, Loader2, Quote } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const healthQuotes = [
    {
        text: "Health is not valued until sickness comes.",
        author: "Thomas Fuller"
    },
    {
        text: "The greatest wealth is health.",
        author: "Virgil"
    },
    {
        text: "Take care of your body. It's the only place you have to live.",
        author: "Jim Rohn"
    },
    {
        text: "Your health is an investment, not an expense.",
        author: "Anonymous"
    },
    {
        text: "A healthy outside starts from the inside.",
        author: "Robert Urich"
    }
];

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % healthQuotes.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', data);
            login(response.data.data.token, response.data.data.user);
            toast.success('Welcome back!');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            toast.error('Login Failed', { description: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding & Quote */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Logo & Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Heart className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Medin Connect</h1>
                                <p className="text-sm text-white/80">Advanced Healthcare Platform</p>
                            </div>
                        </div>
                    </div>

                    {/* Rotating Quote */}
                    <div className="space-y-6">
                        <Quote className="w-12 h-12 text-white/30" />
                        <div className="transition-opacity duration-500">
                            <p className="text-2xl font-light leading-relaxed mb-4">
                                "{healthQuotes[currentQuote].text}"
                            </p>
                            <p className="text-lg text-white/70">
                                — {healthQuotes[currentQuote].author}
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
                        <div className="text-center">
                            <p className="text-3xl font-bold">24/7</p>
                            <p className="text-sm text-white/70">Support</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">500+</p>
                            <p className="text-sm text-white/70">Doctors</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">50k+</p>
                            <p className="text-sm text-white/70">Patients</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <Heart className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold text-primary">Medin Connect</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
                        <p className="text-foreground/60">Sign in to access your healthcare dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-foreground/40" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/40 transition-all focus:ring-2 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-foreground/40" />
                                </div>
                                <input
                                    {...register('password')}
                                    type="password"
                                    className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/40 transition-all focus:ring-2 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-foreground/60">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-semibold text-primary hover:underline transition-all">
                                Register now
                            </Link>
                        </p>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 pt-8 border-t border-border">
                        <p className="text-xs text-center text-foreground/50 mb-4">Trusted by healthcare professionals worldwide</p>
                        <div className="flex justify-center gap-6 text-foreground/30">
                            <div className="text-center">
                                <p className="text-sm font-semibold">🔒 Secure</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold">✓ HIPAA Compliant</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold">⚡ Fast</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
