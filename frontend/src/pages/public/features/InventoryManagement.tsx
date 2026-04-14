import React from 'react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Package, AlertCircle, BarChart3, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const InventoryManagement = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Inventory Management Software | Stock Tracking | Oru ERP"
        description="Complete inventory management for agencies. Track stock levels, manage orders, and optimize procurement."
        keywords="inventory management software, stock tracking, warehouse management, inventory control system"
      />

      <section className="py-24 px-4 md:px-8 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm font-semibold text-gray-600 mb-4">INVENTORY MANAGEMENT</div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Control your inventory.
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Track stock levels, manage orders, and optimize inventory to reduce waste and improve profitability.
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
            <p className="text-lg text-gray-600">Track and optimize your inventory.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <Package className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Stock Level Tracking</h3>
              <p className="text-gray-600 leading-relaxed">Real-time visibility into stock levels across all warehouses and locations.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <AlertCircle className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Reorder Management</h3>
              <p className="text-gray-600 leading-relaxed">Automatic low-stock alerts and reorder point management to prevent stockouts.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <BarChart3 className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Inventory Valuation</h3>
              <p className="text-gray-600 leading-relaxed">Track inventory value and generate cost analysis reports for financial planning.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <Zap className="h-10 w-10 text-black mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">Automated Ordering</h3>
              <p className="text-gray-600 leading-relaxed">Streamline procurement with automated purchase order generation and supplier management.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-8 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Right inventory levels drive profitability.</h2>
          <Link to="/agency-signup?feature=inventory-management">
            <Button size="lg" className="h-14 px-10 text-base gap-2 bg-black text-white hover:bg-gray-900">
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default InventoryManagement;
