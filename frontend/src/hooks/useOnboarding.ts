import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useOnboarding = () => {
    const { user } = useAuth();
    const storageKey = `oru_onboarding_${user?.id}`;
    
    // Default state: step 1 is always completed
    const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

    useEffect(() => {
        if (!user) return;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Ensure step 1 is always in the array
                const steps = new Set([...parsed, 1]);
                setCompletedSteps(Array.from(steps));
            } catch {
                setCompletedSteps([1]);
            }
        } else {
            localStorage.setItem(storageKey, JSON.stringify([1]));
        }
    }, [user, storageKey]);

    const markComplete = (step: number) => {
        setCompletedSteps((prev) => {
            const next = Array.from(new Set([...prev, step]));
            localStorage.setItem(storageKey, JSON.stringify(next));
            return next;
        });
    };

    const isComplete = (step: number) => completedSteps.includes(step);

    return { completedSteps, markComplete, isComplete };
};
