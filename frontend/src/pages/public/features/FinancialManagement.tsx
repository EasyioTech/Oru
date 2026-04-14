import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, PieChart, Receipt, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinancialManagement = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Financial Management Software for Agencies | Accounting | Oru ERP"
        description="Complete financial management for agencies. Track expenses, manage accounting, and understand profitability."
        keywords="financial management software, accounting software, expense tracking, financial reporting"
      />

      <section className="py-24 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-semibold text-gray-600 mb-4">FINANCIAL MANAGEMENT</div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Know your financial health.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track revenue, expenses, and profitability with real-time financial dashboards and reports.
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
            <p className="text-lg text-gray-600">Comprehensive financial controls and visibility.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <DollarSign className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Expense Tracking</h3>
              <p className="text-gray-600 leading-relaxed">Track all business expenses and categorize spending by project or department.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <Receipt className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">General Ledger</h3>
              <p className="text-gray-600 leading-relaxed">Maintain accurate accounting records with complete transaction history and audit trails.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <TrendingUp className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Financial Reports</h3>
              <p className="text-gray-600 leading-relaxed">Generate profit and loss statements, balance sheets, and cash flow reports on demand.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <PieChart className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Profitability Analysis</h3>
              <p className="text-gray-600 leading-relaxed">Understand gross margin, net profit, and identify which projects drive profitability.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Financial control drives business growth.</h2>
          <Link to="/agency-signup?feature=financial-management">
            <Button size="lg" className="h-14 px-10 text-base gap-2 bg-black text-white hover:bg-gray-900">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FinancialManagement;
