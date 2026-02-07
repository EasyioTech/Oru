import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '@/config/api';

export function useSetupStatus() {
  const navigate = useNavigate();
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const agencyDatabase = localStorage.getItem('agency_database');
        if (!agencyDatabase) {
          navigate('/dashboard');
          return;
        }

        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(
          `${apiBaseUrl}/api/agencies/check-setup?database=${encodeURIComponent(agencyDatabase || '')}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              'X-Agency-Database': agencyDatabase || '',
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.setupComplete) {
            setSetupComplete(true);
            navigate('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
      } finally {
        setIsCheckingSetup(false);
      }
    };

    checkSetupStatus();
  }, [navigate]);

  return { isCheckingSetup, setupComplete };
}
