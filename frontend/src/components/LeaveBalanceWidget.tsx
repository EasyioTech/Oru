import React from 'react';
import { Calendar, AlertTriangle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoadingSpinner } from './LoadingSpinner';

interface LeaveBalance {
  leave_type_name: string;
  allocated_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export const LeaveBalanceWidget = ({
  employeeId,
  year = new Date().getFullYear(),
  onRequestLeave,
  compact = false
}: {
  employeeId?: string;
  year?: number;
  onRequestLeave?: () => void;
  compact?: boolean;
}) => {
  const { data: balances, isLoading: loading } = useQuery({
    queryKey: ['leave-balances', employeeId, year],
    queryFn: async () => {
      const res = await api.get('/hr/leaves/balances', { params: { employeeId, year } });
      return (res.data.data || []) as LeaveBalance[];
    },
  });

  const totalAllocated = balances?.reduce((sum, b) => sum + Number(b.allocated_days), 0) || 0;
  const totalUsed = balances?.reduce((sum, b) => sum + Number(b.used_days), 0) || 0;
  const totalPending = balances?.reduce((sum, b) => sum + Number(b.pending_days), 0) || 0;
  const totalRemaining = balances?.reduce((sum, b) => sum + Number(b.remaining_days), 0) || 0;

  if (loading) return <Card><CardContent className="p-6"><LoadingSpinner size="md" text="Loading leave balances..." /></CardContent></Card>;

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3 flex justify-between flex-row">
          <CardTitle className="text-base">Leave Balance {year}</CardTitle>
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><div className="text-lg font-semibold text-green-600">{totalRemaining}</div><div className="text-xs">Available</div></div>
            <div><div className="text-lg font-semibold text-blue-600">{totalUsed}</div><div className="text-xs">Used</div></div>
            <div><div className="text-lg font-semibold text-orange-600">{totalPending}</div><div className="text-xs">Pending</div></div>
          </div>
          {onRequestLeave && <Button size="sm" onClick={onRequestLeave} className="w-full"><Plus className="w-3 h-3 mr-1" /> Request Leave</Button>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Leave Balances {year}</CardTitle>
          <CardDescription>Your annual leave allowances and usage</CardDescription>
        </div>
        <Calendar className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-bold text-green-600">{totalRemaining}</div><div className="text-sm">Days Available</div></div>
          <div><div className="text-2xl font-bold text-blue-600">{totalUsed}</div><div className="text-sm">Days Used</div></div>
          <div><div className="text-2xl font-bold text-orange-600">{totalPending}</div><div className="text-sm">Days Pending</div></div>
          <div><div className="text-2xl font-bold text-gray-600">{totalAllocated}</div><div className="text-sm">Total Allocated</div></div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h4 className="font-medium">Leave Type Breakdown</h4>
          {balances?.map((balance) => {
            const usagePercentage = totalAllocated > 0 ? ((Number(balance.used_days) + Number(balance.pending_days)) / Number(balance.allocated_days)) * 100 : 0;
            return (
              <div key={balance.leave_type_name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{balance.leave_type_name}</span>
                    {usagePercentage >= 90 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="text-sm text-muted-foreground">{balance.remaining_days} / {balance.allocated_days} days</div>
                </div>
                <Progress value={usagePercentage} className="h-2" />
              </div>
            );
          })}
        </div>
        {onRequestLeave && (
          <><Separator /><div className="flex justify-center"><Button onClick={onRequestLeave}><Plus className="w-4 h-4 mr-2" /> Request Leave</Button></div></>
        )}
      </CardContent>
    </Card>
  );
};