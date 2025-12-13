import CircuitBreaker from 'opossum';
import { Logger } from '../utils/logger'; // Assuming Logger exists, or I will use console

// Mock External Insurance API Service
const checkInsuranceEligibility = async (patientId: string): Promise<{ eligible: boolean; plan: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

    // Simulate random failure (40% chance for testing)
    if (Math.random() < 0.4) {
        throw new Error('Insurance API connection timeout');
    }

    return {
        eligible: true,
        plan: 'Premium Health Plus'
    };
};

// Circuit Breaker Options
const options = {
    timeout: 3000, 
    errorThresholdPercentage: 50, 
    resetTimeout: 10000, // 10s cooldown
    volumeThreshold: 3 // Open after checking just 3 requests (if >50% fail)
};

// Create Circuit Breaker
export const insuranceBreaker = new CircuitBreaker(checkInsuranceEligibility, options);

// Events for Observability
insuranceBreaker.on('open', () => Logger.warn('[CircuitBreaker] OPEN: Insurance API is down'));
insuranceBreaker.on('halfOpen', () => Logger.info('[CircuitBreaker] HALF-OPEN: Testing Insurance API'));
insuranceBreaker.on('close', () => Logger.info('[CircuitBreaker] CLOSE: Insurance API recovered'));
insuranceBreaker.fallback(() => {
    Logger.error('[CircuitBreaker] Fallback triggered');
    return { eligible: false, plan: 'Unknown (System Unavailable)' };
});

export const checkInsurance = async (patientId: string) => {
    return insuranceBreaker.fire(patientId);
};
