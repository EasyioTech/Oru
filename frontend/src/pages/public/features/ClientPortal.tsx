import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Eye, FileText, MessageSquare, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientPortal = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Client Portal Software for Agencies | Oru ERP"
        description="Give clients access to project status, documents, and invoices. Self-service client portal for agencies."
        keywords="client portal software, project portal, client collaboration tool, self-service portal"
      />

      <section className="py-24 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-semibold text-gray-600 mb-4">CLIENT PORTAL</div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Empower your clients with visibility.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Let clients see project status, access deliverables, and track invoices. Reduce support requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 h-12 text-base bg-black text-white hover:bg-gray-900">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base border-gray-300 text-black hover:bg-gray-50">Watch Demo</Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Features</h2>
            <p className="text-lg text-gray-600">Self-service client engagement.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <Eye className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Project Visibility</h3>
              <p className="text-gray-600 leading-relaxed">Clients can see project status, timeline, and progress in real-time from any device.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <FileText className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Document Sharing</h3>
              <p className="text-gray-600 leading-relaxed">Share deliverables, proposals, and reports securely. Version control included.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <MessageSquare className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Feedback & Approvals</h3>
              <p className="text-gray-600 leading-relaxed">Collect client feedback and approvals directly in the portal. Track request history.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <Lock className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Secure Access</h3>
              <p className="text-gray-600 leading-relaxed">Role-based access control. Clients see only their projects and information.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Reduce support requests. Increase client satisfaction.</h2>
          <Link to="/agency-signup?feature=client-portal">
            <Button size="lg" className="h-14 px-10 text-base gap-2 bg-black text-white hover:bg-gray-900">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ClientPortal;
