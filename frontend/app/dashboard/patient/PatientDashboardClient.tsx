"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/src/lib/api';
import { useAuth } from '@/src/context/AuthContext';
import { Loader2, Calendar, Clock, User as UserIcon, LogOut, X, CheckCircle, LayoutGrid, List } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { toast } from 'sonner';

interface Appointment {
    id: string;
    doctor: {
        firstName: string;
        lastName: string;
        specialization: string;
    };
    dateTime: string;
    status: string;
    reason: string;
    notes: any[];
}

interface Doctor {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
}

interface TimeSlot {
    dateTime: string;
    available: boolean;
}

export default function PatientDashboard() {
    const { user, logout } = useAuth();
    const queryClient = useQueryClient();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [bookingStep, setBookingStep] = useState<'doctor' | 'slot' | 'confirm'>('doctor');
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

    const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
        queryKey: ['appointments'],
        queryFn: async () => {
            const response = await api.get('/appointments');
            return response.data.data;
        },
    });

    const { data: doctors } = useQuery<Doctor[]>({
        queryKey: ['doctors'],
        queryFn: async () => {
            const response = await api.get('/doctors');
            return response.data.data;
        },
        enabled: showBookingModal,
    });

    const fetchSlots = async (doctorId: string) => {
        setLoadingSlots(true);
        try {
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = addDays(new Date(), 6).toISOString().split('T')[0];
            const response = await api.get('/appointments/available-slots', {
                params: { doctorId, startDate, endDate }
            });
            setSlots(response.data.data || []);
            setBookingStep('slot');
        } catch (err) {
            console.error('Failed to fetch slots', err);
        } finally {
            setLoadingSlots(false);
        }
    };

    const bookingMutation = useMutation({
        mutationFn: async (data: { doctorId: string; dateTime: string; reason: string }) => {
            await api.post('/appointments', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            resetBookingModal();
            toast.success('Appointment booked successfully!');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to book appointment');
        }
    });

    const cancelMutation = useMutation({
        mutationFn: async ({ appointmentId, reason }: { appointmentId: string; reason?: string }) => {
            await api.patch(`/appointments/${appointmentId}/cancel`, { cancellationReason: reason });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            setShowCancelModal(false);
            setAppointmentToCancel(null);
            setCancellationReason('');
            toast.success('Appointment cancelled successfully');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to cancel appointment');
        }
    });

    const handleCancelClick = (appointmentId: string) => {
        setAppointmentToCancel(appointmentId);
        setShowCancelModal(true);
    };

    const handleConfirmCancel = () => {
        if (appointmentToCancel) {
            cancelMutation.mutate({ appointmentId: appointmentToCancel, reason: cancellationReason });
        }
    };

    const resetBookingModal = () => {
        setShowBookingModal(false);
        setSelectedDoctor('');
        setSelectedSlot(null);
        setReason('');
        setBookingStep('doctor');
        setSlots([]);
    };

    const handleDoctorSelect = (doctorId: string) => {
        setSelectedDoctor(doctorId);
        fetchSlots(doctorId);
    };

    const handleSlotSelect = (slotDateTime: string) => {
        setSelectedSlot(slotDateTime);
        setBookingStep('confirm');
    };

    const handleConfirmBooking = () => {
        if (selectedDoctor && selectedSlot && reason) {
            bookingMutation.mutate({
                doctorId: selectedDoctor,
                dateTime: selectedSlot,
                reason
            });
        }
    };

    // Group slots by date
    const slotsByDate = slots.reduce((acc, slot) => {
        const date = new Date(slot.dateTime).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(slot);
        return acc;
    }, {} as Record<string, TimeSlot[]>);

    const dates = Object.keys(slotsByDate).slice(0, 7);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-surface shadow-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary">Medin Connect</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-foreground">Welcome, {user?.email}</span>
                            <button
                                onClick={logout}
                                className="p-2 rounded-full hover:bg-muted text-foreground/60 hover:text-foreground transition-colors"
                                title="Sign Out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">Your Appointments</h2>
                        <p className="mt-1 text-sm text-foreground/60">Manage your upcoming and past medical appointments.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Toggle */}
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'card'
                                    ? 'bg-surface shadow-sm text-primary'
                                    : 'text-foreground/60 hover:text-foreground'
                                    }`}
                                title="Card View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'table'
                                    ? 'bg-surface shadow-sm text-primary'
                                    : 'text-foreground/60 hover:text-foreground'
                                    }`}
                                title="Table View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={() => setShowBookingModal(true)}
                            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                        >
                            Book New
                        </button>
                    </div>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> Failed to load appointments. Please try again later.</span>
                    </div>
                ) : appointments?.length === 0 ? (
                    <div className="text-center py-12 bg-surface rounded-lg shadow-sm border border-border">
                        <Calendar className="mx-auto h-12 w-12 text-foreground/40" />
                        <h3 className="mt-2 text-sm font-medium text-foreground">No appointments</h3>
                        <p className="mt-1 text-sm text-foreground/60">Get started by creating a new appointment.</p>
                    </div>
                ) : viewMode === 'card' ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {appointments?.map((appointment) => (
                            <div key={appointment.id} className="bg-surface overflow-hidden shadow rounded-xl border border-border hover:shadow-lg transition-all">
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-shrink-0 bg-primary/10 rounded-md p-3">
                                            <UserIcon className="h-6 w-6 text-primary" />
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                            appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {appointment.status}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <h3 className="text-lg font-medium text-foreground">Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}</h3>
                                        <p className="text-sm text-primary font-medium">{appointment.doctor.specialization}</p>

                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center text-sm text-foreground/70">
                                                <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-foreground/50" />
                                                {format(new Date(appointment.dateTime), 'MMMM d, yyyy')}
                                            </div>
                                            <div className="flex items-center text-sm text-foreground/70">
                                                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-foreground/50" />
                                                {format(new Date(appointment.dateTime), 'h:mm a')}
                                            </div>
                                        </div>

                                        {appointment.reason && (
                                            <p className="mt-4 text-sm text-foreground/70 border-t border-border pt-3">
                                                <span className="font-medium text-foreground">Reason:</span> {appointment.reason}
                                            </p>
                                        )}

                                        {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                                            <div className="mt-4 pt-4 border-t flex gap-2">
                                                <button
                                                    onClick={() => handleCancelClick(appointment.id)}
                                                    className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface rounded-lg shadow border border-border overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {appointments?.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-foreground">
                                                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                                    </div>
                                                    <div className="text-sm text-primary">{appointment.doctor.specialization}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-foreground">{format(new Date(appointment.dateTime), 'MMM d, yyyy')}</div>
                                            <div className="text-sm text-foreground/60">{format(new Date(appointment.dateTime), 'h:mm a')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-foreground/70 max-w-xs truncate">{appointment.reason || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                                                <button
                                                    onClick={() => handleCancelClick(appointment.id)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-surface rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-foreground">Book New Appointment</h3>
                            <button onClick={resetBookingModal} className="text-foreground/40 hover:text-foreground transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Step Indicator */}
                        <div className="mb-6 flex items-center justify-center gap-2">
                            <div className={`flex items-center gap-2 ${bookingStep === 'doctor' ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep !== 'doctor' ? 'bg-green-100 text-green-600' : 'bg-blue-100'}`}>
                                    {bookingStep !== 'doctor' ? <CheckCircle className="w-5 h-5" /> : '1'}
                                </div>
                                <span className="text-sm font-medium">Select Doctor</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-300"></div>
                            <div className={`flex items-center gap-2 ${bookingStep === 'slot' ? 'text-blue-600' : bookingStep === 'confirm' ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep === 'confirm' ? 'bg-green-100 text-green-600' : bookingStep === 'slot' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    {bookingStep === 'confirm' ? <CheckCircle className="w-5 h-5" /> : '2'}
                                </div>
                                <span className="text-sm font-medium">Pick Time</span>
                            </div>
                            <div className="w-12 h-0.5 bg-gray-300"></div>
                            <div className={`flex items-center gap-2 ${bookingStep === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep === 'confirm' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    3
                                </div>
                                <span className="text-sm font-medium">Confirm</span>
                            </div>
                        </div>

                        {/* Step 1: Doctor Selection */}
                        {bookingStep === 'doctor' && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">Select Doctor</label>
                                <div className="grid gap-3">
                                    {doctors?.map((doctor) => (
                                        <button
                                            key={doctor.id}
                                            onClick={() => handleDoctorSelect(doctor.id)}
                                            className="text-left p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                                        >
                                            <p className="font-semibold text-foreground">Dr. {doctor.firstName} {doctor.lastName}</p>
                                            <p className="text-sm text-primary">{doctor.specialization}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Slot Selection */}
                        {bookingStep === 'slot' && (
                            <div>
                                {loadingSlots ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="text-lg font-semibold">Available Time Slots</h4>
                                            <button onClick={() => setBookingStep('doctor')} className="text-sm text-blue-600 hover:underline">
                                                Change Doctor
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                            {dates.map((date) => (
                                                <div key={date} className="border rounded-lg p-3">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2 text-center">
                                                        {format(new Date(date), 'EEE, MMM d')}
                                                    </p>
                                                    <div className="space-y-2">
                                                        {slotsByDate[date].map((slot) => (
                                                            <button
                                                                key={slot.dateTime}
                                                                onClick={() => slot.available && handleSlotSelect(slot.dateTime)}
                                                                disabled={!slot.available}
                                                                className={`w-full px-2 py-2 text-xs rounded transition-all ${slot.available
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                                    }`}
                                                            >
                                                                {format(new Date(slot.dateTime), 'h:mm a')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 3: Confirm */}
                        {bookingStep === 'confirm' && (
                            <div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-900">
                                        <strong>Selected Time:</strong> {selectedSlot && format(new Date(selectedSlot), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                                    </p>
                                </div>
                                <div className="mb-4">
                                    <button onClick={() => setBookingStep('slot')} className="text-sm text-blue-600 hover:underline">
                                        Change Time
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe your symptoms or reason for visit..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button
                                        onClick={resetBookingModal}
                                        className="px-4 py-2 text-foreground/60 hover:bg-muted rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={!reason || bookingMutation.isPending}
                                        className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 font-semibold transition-all"
                                    >
                                        {bookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancellation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface rounded-lg p-6 w-full max-w-md border border-border shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-foreground">Cancel Appointment</h3>
                            <button onClick={() => setShowCancelModal(false)} className="text-foreground/40 hover:text-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Please let us know why you're cancelling this appointment. This helps us improve our service.
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason (Optional)</label>
                            <select
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a reason</option>
                                <option value="Feeling better">Feeling better</option>
                                <option value="Schedule conflict">Schedule conflict</option>
                                <option value="Found another doctor">Found another doctor</option>
                                <option value="Financial reasons">Financial reasons</option>
                                <option value="Transportation issues">Transportation issues</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                Keep Appointment
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={cancelMutation.isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
