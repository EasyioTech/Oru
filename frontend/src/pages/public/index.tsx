import LandingPage from '@/components/landing/LandingPage';
import { SEO } from '@/components/shared/SEO';

export default function Landing() {
  return (
    <>
      <SEO 
        title="Oru ERP - The Future of Agency Management"
        description="Streamline your workflows, manage your projects, and scale your agency with Oru ERP. The all-in-one business solution."
        keywords="ERP, agency management, Oru, CRM, project management, business automation, scalable ERP"
      />
      <LandingPage />
    </>
  );
}
