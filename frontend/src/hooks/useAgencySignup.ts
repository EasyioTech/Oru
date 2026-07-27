import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAgencySignupStore } from './useAgencySignupStore';
import { toast } from 'sonner';

export const useAgencySignup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const data = useAgencySignupStore();

    const submitSignup = async () => {
        try {
            setIsLoading(true);
            const response = await api.post('/auth/agency-signup', {
                agencyName: data.agencyName,
                industry: data.industry,
                teamSize: data.teamSize,
                name: data.name,
                email: data.email,
                password: data.password,
            });

            if (response.data?.success) {
                navigate('/auth?registered=true');
            }
        } catch (error: any) {
            const errData = error.response?.data;
            if (errData?.details && Array.isArray(errData.details) && errData.details.length > 0) {
                toast.error(errData.details[0].message);
            } else {
                toast.error(errData?.message || 'Failed to create workspace');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return { submitSignup, isLoading };
};
