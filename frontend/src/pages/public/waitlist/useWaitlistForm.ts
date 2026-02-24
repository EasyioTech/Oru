import { useReducer, useCallback, useState } from 'react';

export interface WaitlistFormData {
    // Page 1
    businessModel: string;
    teamSize: string;
    // Page 2 (segment-specific)
    painPoints: string[];
    // Page 3
    currentTools: string;
    featureRanking: string[];
    chatRating: number;
    // Page 4
    monthlySpend: string;
    billingPreference: string;
    noBrainerPrice: string;
    // Page 5
    name: string;
    businessName: string;
    contact: string;
    email: string;
}

const initialFormData: WaitlistFormData = {
    businessModel: '',
    teamSize: '',
    painPoints: [],
    currentTools: '',
    featureRanking: [
        'Unified File Management',
        'Automated HR & Payroll',
        'Task & KPI Engine',
        'Smart Invoicing',
        'Koe (Native Chat)',
    ],
    chatRating: 0,
    monthlySpend: '',
    billingPreference: '',
    noBrainerPrice: '',
    name: '',
    businessName: '',
    contact: '',
    email: '',
};

/**
 * Step IDs for the multi-step flow.
 * The actual step shown depends on conditional routing.
 */
export type StepId =
    | 'gateway'
    | 'aspirants'
    | 'lean-team'
    | 'growing-engine'
    | 'scaling-operation'
    | 'oru-match'
    | 'stack-spend'
    | 'lead-capture'
    | 'thank-you';

type FormAction =
    | { type: 'SET_FIELD'; field: keyof WaitlistFormData; value: string | string[] | number }
    | { type: 'TOGGLE_PAIN_POINT'; value: string; max?: number }
    | { type: 'SET_FEATURE_RANKING'; value: string[] }
    | { type: 'RESET' };

function formReducer(state: WaitlistFormData, action: FormAction): WaitlistFormData {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'TOGGLE_PAIN_POINT': {
            const exists = state.painPoints.includes(action.value);
            if (exists) {
                return { ...state, painPoints: state.painPoints.filter(p => p !== action.value) };
            }
            const max = action.max ?? 2;
            if (state.painPoints.length >= max) return state;
            return { ...state, painPoints: [...state.painPoints, action.value] };
        }
        case 'SET_FEATURE_RANKING':
            return { ...state, featureRanking: action.value };
        case 'RESET':
            return initialFormData;
        default:
            return state;
    }
}

/**
 * Determines which Page 2 step to route to based on Q1 and Q2 answers.
 */
function getPage2Step(data: WaitlistFormData): StepId {
    if (data.businessModel === 'exploring') return 'aspirants';
    if (data.teamSize === '1-10') return 'lean-team';
    if (data.teamSize === '11-40') return 'growing-engine';
    if (data.teamSize === '40+') return 'scaling-operation';
    // Default fallback
    return 'lean-team';
}

/**
 * Returns the ordered sequence of steps for the current form state.
 */
function getStepSequence(data: WaitlistFormData): StepId[] {
    const page2 = getPage2Step(data);
    return ['gateway', page2, 'oru-match', 'stack-spend', 'lead-capture', 'thank-you'];
}

export function useWaitlistForm() {
    const [formData, dispatch] = useReducer(formReducer, initialFormData);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const stepSequence = getStepSequence(formData);
    const currentStep = stepSequence[currentStepIndex];
    const totalSteps = stepSequence.length - 1; // Exclude thank-you from count
    const progress = Math.min((currentStepIndex / totalSteps) * 100, 100);

    const setField = useCallback(
        (field: keyof WaitlistFormData, value: string | string[] | number) => {
            dispatch({ type: 'SET_FIELD', field, value });
        },
        []
    );

    const togglePainPoint = useCallback(
        (value: string, max?: number) => {
            dispatch({ type: 'TOGGLE_PAIN_POINT', value, max });
        },
        []
    );

    const setFeatureRanking = useCallback(
        (value: string[]) => {
            dispatch({ type: 'SET_FEATURE_RANKING', value });
        },
        []
    );

    const next = useCallback(() => {
        setCurrentStepIndex(prev => {
            const seq = getStepSequence(formData);
            return Math.min(prev + 1, seq.length - 1);
        });
    }, [formData]);

    const back = useCallback(() => {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    }, []);

    const submitToSheets = useCallback(async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        const webhookUrl = import.meta.env.VITE_SHEETS_WEBHOOK_URL;

        if (!webhookUrl) {
            console.warn('Google Sheets webhook URL not configured. Data logged to console.');
            console.log('Waitlist Submission:', formData);
            setIsSubmitting(false);
            next();
            return;
        }

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    featureRanking: formData.featureRanking.join(', '),
                    painPoints: formData.painPoints.join(', '),
                    timestamp: new Date().toISOString(),
                }),
            });
            next();
        } catch (err) {
            console.error('Submission error:', err);
            setSubmitError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, next]);

    return {
        formData,
        currentStep,
        currentStepIndex,
        totalSteps,
        progress,
        stepSequence,
        setField,
        togglePainPoint,
        setFeatureRanking,
        next,
        back,
        submitToSheets,
        isSubmitting,
        submitError,
    };
}
