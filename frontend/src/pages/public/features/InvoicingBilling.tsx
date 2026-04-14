import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { FileText, CreditCard, CheckCircle2, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const InvoicingBilling = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Invoicing & Billing Software for Agencies | Oru ERP"
        description="Automated invoicing and billing for agencies. Generate professional invoices, track payments, and manage billing workflows."
        keywords="invoicing software, billing management, invoice generation, payment tracking, client billing"
      />

      <section className="py-24 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-semibold text-gray-600 mb-4">INVOICING & BILLING</div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Get paid faster.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Automate invoicing, track payments, and manage billing workflows to improve cash flow.
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
            <p className="text-lg text-gray-600">Streamline your billing process.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <FileText className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Professional Invoices</h3>
              <p className="text-gray-600 leading-relaxed">Generate customized, professional invoices automatically from projects and time entries.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <CreditCard className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Payment Tracking</h3>
              <p className="text-gray-600 leading-relaxed">Track invoice status, payment dates, and outstanding balances in real-time.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <CheckCircle2 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Recurring Billing</h3>
              <p className="text-gray-600 leading-relaxed">Set up automatic recurring invoices for retainer agreements and subscription services.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <BarChart3 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Revenue Analytics</h3>
              <p className="text-gray-600 leading-relaxed">Monitor cash flow, track revenue by client, and forecast income with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Automate billing. Improve cash flow.</h2>
          <Link to="/agency-signup?feature=invoicing-billing">
            <Button size="lg" className="h-14 px-10 text-base gap-2 bg-black text-white hover:bg-gray-900">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default InvoicingBilling;
