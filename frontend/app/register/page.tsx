"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/lib/api';
import Link from 'next/link';
import { Loader2, Heart, Mail, Lock, User, Calendar, Phone, MapPin, Award, FileBadge } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['PATIENT', 'DOCTOR']),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    // Patient specific
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    // Doctor specific
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
}).refine((data) => {
    if (data.role === 'PATIENT') {
        return !!data.dateOfBirth && !!data.gender;
    }
    if (data.role === 'DOCTOR') {
        return !!data.specialization && !!data.licenseNumber;
    }
    return true;
}, {
    message: "Please fill in all required fields for your selected role",
    path: ["role"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'PATIENT'
        }
    });
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterForm) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/register', data);
            if (response.data.data) {
                toast.success('Account created successfully!', { description: 'Please login to continue.' });
                router.push('/login?registered=true');
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            toast.error('Registration Failed', { description: message });

            if (err.response?.data?.errors) {
                console.error('Validation errors:', err.response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-surface p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-border">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
                    <p className="text-foreground/60 mt-2">Join Medin Connect today</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm break-words">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-2">I am a...</label>
                            <select
                                {...register('role')}
                                className={`block w-full rounded-lg border bg-surface px-4 py-3 text-foreground transition-all focus:ring-2 ${errors.role ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                            >
                                <option value="PATIENT">Patient</option>
                                <option value="DOCTOR">Doctor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-foreground/40" />
                                </div>
                                <input
                                    {...register('firstName')}
                                    className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/40 transition-all focus:ring-2 ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                    placeholder="John"
                                />
                            </div>
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-foreground/40" />
                                </div>
                                <input
                                    {...register('lastName')}
                                    className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/40 transition-all focus:ring-2 ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                    placeholder="Doe"
                                />
                            </div>
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                        </div>

                        <div className="col-span-1 md:col-span-2">
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

                        <div className="col-span-1 md:col-span-2">
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

                        {selectedRole === 'PATIENT' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-foreground/40" />
                                        </div>
                                        <input
                                            {...register('dateOfBirth')}
                                            type="date"
                                            className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground transition-all focus:ring-2 ${errors.dateOfBirth ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                        />
                                    </div>
                                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
                                    <select
                                        {...register('gender')}
                                        className={`block w-full rounded-lg border bg-surface px-4 py-3 text-foreground transition-all focus:ring-2 ${errors.gender ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-foreground/40" />
                                        </div>
                                        <input
                                            {...register('phone')}
                                            className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/40 transition-all focus:ring-2 ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-foreground/40" />
                                        </div>
                                        <input
                                            {...register('address')}
                                            className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/40 transition-all focus:ring-2 ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                            placeholder="123 Main St, City, Country"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedRole === 'DOCTOR' && (
                            <>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-2">Specialization</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Award className="h-5 w-5 text-foreground/40" />
                                        </div>
                                        <select
                                            {...register('specialization')}
                                            className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground transition-all focus:ring-2 ${errors.specialization ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                        >
                                            <option value="">Select Specialization</option>
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Dermatology">Dermatology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                            <option value="General Medicine">General Medicine</option>
                                        </select>
                                    </div>
                                    {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization.message}</p>}
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-foreground mb-2">License Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FileBadge className="h-5 w-5 text-foreground/40" />
                                        </div>
                                        <input
                                            {...register('licenseNumber')}
                                            className={`pl-10 block w-full rounded-lg border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/40 transition-all focus:ring-2 ${errors.licenseNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-input focus:border-primary focus:ring-primary/20'}`}
                                            placeholder="LIC-12345678"
                                        />
                                    </div>
                                    {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber.message}</p>}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-foreground/60">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline transition-all">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
