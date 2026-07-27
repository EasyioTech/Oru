import { create } from 'zustand';

interface SignupState {
    step: number;
    agencyName: string;
    industry: string;
    teamSize: string;
    name: string;
    email: string;
    password: string;
    setStep: (step: number) => void;
    updateData: (data: Partial<SignupState>) => void;
}

export const useAgencySignupStore = create<SignupState>((set) => ({
    step: 1,
    agencyName: '',
    industry: 'Professional Services',
    teamSize: 'small',
    name: '',
    email: '',
    password: '',
    setStep: (step) => set({ step }),
    updateData: (data) => set((state) => ({ ...state, ...data })),
}));
