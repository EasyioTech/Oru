import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart, PieChart, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReportingAnalytics = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Business Analytics & Reporting Software | Oru ERP"
        description="Comprehensive reporting and analytics for agencies. Real-time dashboards, custom reports, and data-driven insights."
        keywords="business analytics, reporting software, data analytics, business intelligence, dashboard software"
      />

      <section className="py-24 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-semibold text-gray-600 mb-4">REPORTING & ANALYTICS</div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            See your business clearly.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Real-time dashboards and custom reports to make data-driven decisions about your business.
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
            <p className="text-lg text-gray-600">Analytics that drive decisions.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <BarChart3 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Pre-built Dashboards</h3>
              <p className="text-gray-600 leading-relaxed">Executive dashboards showing key metrics like revenue, profitability, and project status at a glance.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <LineChart className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Custom Reports</h3>
              <p className="text-gray-600 leading-relaxed">Build custom reports with filters and drill-down capability for deeper analysis.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <PieChart className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Profitability Analytics</h3>
              <p className="text-gray-600 leading-relaxed">Deep insights into project profitability, client margins, and cost drivers.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <TrendingUp className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Trend Analysis</h3>
              <p className="text-gray-600 leading-relaxed">Track trends over time and forecast future performance based on historical data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Data-driven decisions grow agencies.</h2>
          <Link to="/agency-signup?feature=reporting-analytics">
            <Button size="lg" className="h-14 px-10 text-base gap-2 bg-black text-white hover:bg-gray-900">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ReportingAnalytics;
