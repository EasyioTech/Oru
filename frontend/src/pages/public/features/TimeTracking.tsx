import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, BarChart3, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TimeTracking = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Time Tracking Software for Agencies | Billable Hours | Oru ERP"
        description="Track billable hours and employee time. Monitor productivity and ensure accurate client billing with Oru's time tracking."
        keywords="time tracking software, billable hours tracking, employee time tracking, productivity tracking"
      />

      <section className="py-24 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-semibold text-gray-600 mb-4">TIME TRACKING</div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Track every billable hour.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Capture billable time accurately and ensure you bill clients for all work performed.
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
            <p className="text-lg text-gray-600">Accurate time tracking for accurate billing.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <Clock className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Timer & Manual Entry</h3>
              <p className="text-gray-600 leading-relaxed">Use the timer for real-time tracking or manually enter time retroactively by project and task.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <CheckCircle2 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Project Assignment</h3>
              <p className="text-gray-600 leading-relaxed">Assign tracked time to specific projects and tasks automatically for billing.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <BarChart3 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Utilization Reports</h3>
              <p className="text-gray-600 leading-relaxed">Measure billable vs non-billable time and understand resource utilization by employee.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <AlertCircle className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Approval Workflows</h3>
              <p className="text-gray-600 leading-relaxed">Review and approve time entries before invoicing to ensure accuracy.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Never leave billable hours on the table.</h2>
          <Link to="/agency-signup?feature=time-tracking">
            <Button size="lg" className="h-14 px-10 text-base gap-2 bg-black text-white hover:bg-gray-900">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TimeTracking;
