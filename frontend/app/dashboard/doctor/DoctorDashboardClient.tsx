"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { useAuth } from '@/src/context/AuthContext';
import { Loader2, Calendar, Clock, User as UserIcon, LogOut, FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

interface Appointment {
    id: string;
    patient: {
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
    };
    dateTime: string;
    status: string;
    reason: string;
    notes: { id: string, content: string, createdAt: string }[];
}

export default function DoctorDashboard() {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    const { data: appointments, isLoading } = useQuery<Appointment[]>({
        queryKey: ['doctor-appointments'],
        queryFn: async () => {
            const response = await api.get('/appointments');
            return response.data.data;
        },
    });

    const NoteModal = () => {
        const { register, handleSubmit, reset } = useForm<{ content: string }>();
        const addNoteMutation = useMutation({
            mutationFn: async (data: { content: string }) => {
                await api.post(`/appointments/${selectedAppointment?.id}/notes`, data);
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
                setSelectedAppointment(null);
                reset();
            }
        });

        if (!selectedAppointment) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                    <h3 className="text-lg font-bold mb-4">Add Note for {selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}</h3>
                    <form onSubmit={handleSubmit((data) => addNoteMutation.mutate(data))}>
                        <textarea
                            {...register('content', { required: true })}
                            className="w-full border rounded-md p-2 h-32 mb-4"
                            placeholder="Enter clinical notes here..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedAppointment(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addNoteMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {addNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-blue-600">Medin Connect - Provider Portal</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-700">Dr. {user?.email}</span>
                            <button
                                onClick={logout}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Patient Schedule</h2>
                    <p className="mt-1 text-sm text-gray-500">View upcoming appointments and manage patient records.</p>
                </div>

                {appointments?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments scheduled</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments?.map((appointment) => (
                            <div key={appointment.id} className="bg-white shadow rounded-xl border border-gray-100 overflow-hidden">
                                <div className="px-4 py-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1">
                                            <UserIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {appointment.patient.firstName} {appointment.patient.lastName}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {format(new Date(appointment.dateTime), 'MMM d, yyyy')}
                                                </span>
                                                <span className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {format(new Date(appointment.dateTime), 'h:mm a')}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            {appointment.reason && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    <span className="font-medium">Reason:</span> {appointment.reason}
                                                </p>
                                            )}

                                            {appointment.notes.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {appointment.notes.map(note => (
                                                        <div key={note.id} className="text-sm bg-gray-50 p-2 rounded border border-gray-200">
                                                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                                                                <FileText className="w-3 h-3" />
                                                                {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                                                            </div>
                                                            {note.content}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedAppointment(appointment)}
                                        className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Note
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <NoteModal />
        </div>
    );
}
