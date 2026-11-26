/**
 * Financial Metrics Cards Component
 * Displays summary cards for financial overview
 */

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, IndianRupee, Briefcase, Target } from "lucide-react";

interface FinancialMetricsCardsProps {
  totalAssets: number;
  currentBalance: number;
  activeJobs: number;
  netProfit: number;
}

export const FinancialMetricsCards = ({
  totalAssets = 0,
  currentBalance = 0,
  activeJobs = 0,
  netProfit = 0,
}: FinancialMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold">₹{(totalAssets || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <IndianRupee className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">₹{(currentBalance || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold">{activeJobs || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold">₹{(netProfit || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

