import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, BarChart3, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HRManagement = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="HR Management Software for Agencies | Employee Management | Oru ERP"
        description="Complete HR management for agencies. Manage employees, payroll, attendance, performance, and team development."
        keywords="hr management software, employee management system, payroll software, human resources management"
      />

      <section className="py-24 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-semibold text-gray-600 mb-4">HR MANAGEMENT</div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Manage your team with precision.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track employees, manage payroll, monitor attendance, and understand team capacity all in one system.
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
            <p className="text-lg text-gray-600">Everything you need to manage your team.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <Users className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Employee Directory</h3>
              <p className="text-gray-600 leading-relaxed">Centralized employee information including roles, contact details, and employment history.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <Calendar className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Attendance & Time Off</h3>
              <p className="text-gray-600 leading-relaxed">Track attendance, manage vacation requests, and maintain compliance with work hour regulations.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <FileText className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Payroll Management</h3>
              <p className="text-gray-600 leading-relaxed">Automate salary calculations, tax deductions, and payment processing for all employees.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <BarChart3 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Performance Tracking</h3>
              <p className="text-gray-600 leading-relaxed">Monitor team performance, set goals, and manage reviews in one centralized system.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Manage your most valuable asset: your team.</h2>
          <Link to="/agency-signup?feature=hr-management">
            <Button size="lg" className="h-14 px-10 text-base gap-2 bg-black text-white hover:bg-gray-900">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HRManagement;
