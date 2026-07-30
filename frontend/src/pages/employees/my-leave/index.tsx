import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Clock, CheckCircle, XCircle, Plane, Heart, User, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { fetchLeaveTypes, fetchLeaveRequests, LeaveRequest as ApiLeaveRequest } from '@/services/api/hr/leaves';
import LeaveRequestFormDialog from "@/components/shared/LeaveRequestFormDialog";
import { PageHeader } from "@/components/layout/PageHeader";

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  submittedDate: string;
  approver: string | null;
}

interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

const MyLeave = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [showLeaveRequestDialog, setShowLeaveRequestDialog] = useState(false);

  const [leaveBalance, setLeaveBalance] = useState<Record<string, LeaveBalance>>({
    annual: { total: 0, used: 0, remaining: 0 },
    sick: { total: 0, used: 0, remaining: 0 },
    personal: { total: 0, used: 0, remaining: 0 },
    maternity: { total: 0, used: 0, remaining: 0 }
  });
  const [myLeaveRequests, setMyLeaveRequests] = useState<LeaveRequest[]>([]);

  const fetchMyLeaveData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch leave types using REST API
      const leaveTypes = await fetchLeaveTypes();

      // Fetch user's leave requests using REST API
      const leaveRequests = await fetchLeaveRequests();

      // Calculate leave balances
      const balances: Record<string, LeaveBalance> = {};
      const leaveTypeMap = new Map(leaveTypes.map(lt => [lt.id, lt]));

      leaveTypes.forEach(leaveType => {
        const typeName = leaveType.name.toLowerCase();
        const total = leaveType.max_days_per_year || 0;
        
        // Calculate used days (only approved requests)
        const approvedRequests = leaveRequests.filter(
          lr => lr.leave_type_id === leaveType.id && lr.status === 'approved'
        );
        const used = approvedRequests.reduce((sum, lr) => sum + (lr.total_days || 0), 0);
        const remaining = Math.max(0, total - used);

        // Map to common leave types
        let key = 'annual';
        if (typeName.includes('sick')) key = 'sick';
        else if (typeName.includes('personal')) key = 'personal';
        else if (typeName.includes('maternity') || typeName.includes('paternity')) key = 'maternity';

        if (!balances[key] || balances[key].total < total) {
          balances[key] = { total, used, remaining };
        } else {
          // Merge if multiple leave types map to same key
          balances[key].used += used;
          balances[key].remaining = Math.max(0, balances[key].total - balances[key].used);
        }
      });

      // Ensure all keys exist
      ['annual', 'sick', 'personal', 'maternity'].forEach(key => {
        if (!balances[key]) {
          balances[key] = { total: 0, used: 0, remaining: 0 };
        }
      });

      setLeaveBalance(balances);

      // Transform leave requests
      const transformedRequests: LeaveRequest[] = leaveRequests.map((request) => {
        const leaveTypeName = request.leave_type?.name || 'Leave';
        // Note: Currently we only show 'Approved By Admin' if approved. 
        // We could fetch user names for approved_by if needed, but keeping it simple for now.
        const approverName = request.approved_by ? 'Admin/Manager' : null;

        return {
          id: request.id,
          type: leaveTypeName,
          startDate: request.start_date,
          endDate: request.end_date,
          days: request.total_days || 0,
          reason: request.reason || 'No reason provided',
          status: request.status || 'pending',
          submittedDate: request.created_at,
          approver: approverName
        };
      });

      setMyLeaveRequests(transformedRequests);

    } catch (error: any) {
      console.error('Error fetching leave data:', error);
      toast({
        title: "Error",
        description: "Failed to load leave data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);
    useEffect(() => {
        if (user?.id) {
          fetchMyLeaveData();
        }
      }, [user?.id, fetchMyLeaveData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Loading leave data...</span>
        </div>
      </div>
    );
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getLeaveIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'annual leave': return <Plane className="h-5 w-5" />;
      case 'sick leave': return <Heart className="h-5 w-5" />;
      case 'personal leave': return <User className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const LeaveBalanceCard = ({ title, balance, icon, color }: any) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{balance.remaining} days left</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{balance.used}/{balance.total}</p>
            <p className="text-xs text-muted-foreground">Used/Total</p>
          </div>
        </div>
        <Progress value={(balance.used / balance.total) * 100} className="h-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Leave"
        description="Manage your leave requests and view balances"
        actions={
          <Button size="sm" className="h-8 sm:h-9 gap-1.5 text-xs sm:text-sm" onClick={() => setShowLeaveRequestDialog(true)}>
            <Plus className="h-3.5 w-3.5" /> Request Leave
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <LeaveBalanceCard
          title="Annual Leave"
          balance={leaveBalance.annual}
          icon={<Plane className="h-5 w-5 text-blue-600" />}
          color="bg-blue-100"
        />
        <LeaveBalanceCard
          title="Sick Leave"
          balance={leaveBalance.sick}
          icon={<Heart className="h-5 w-5 text-red-600" />}
          color="bg-red-100"
        />
        <LeaveBalanceCard
          title="Personal Leave"
          balance={leaveBalance.personal}
          icon={<User className="h-5 w-5 text-green-600" />}
          color="bg-green-100"
        />
        <LeaveBalanceCard
          title="Maternity Leave"
          balance={leaveBalance.maternity}
          icon={<Heart className="h-5 w-5 text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({myLeaveRequests.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({myLeaveRequests.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({myLeaveRequests.filter(r => r.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({myLeaveRequests.filter(r => r.status === 'rejected').length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Request History</CardTitle>
              <CardDescription>All your leave requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myLeaveRequests.filter(r => selectedTab === 'all' || r.status === selectedTab).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No {selectedTab === 'all' ? '' : selectedTab} leave requests found.
                    </p>
                  </div>
                ) : (
                  myLeaveRequests.filter(r => selectedTab === 'all' || r.status === selectedTab).map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getLeaveIcon(request.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{request.type}</h3>
                            <p className="text-sm text-muted-foreground">Request ID: {request.id}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(request.status)} className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-muted-foreground">{request.days} days</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">{new Date(request.submittedDate).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">Approver: {request.approver}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-muted-foreground text-sm">Reason</p>
                        <p className="text-sm">{request.reason}</p>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Leave Request Dialog */}
      <LeaveRequestFormDialog
        isOpen={showLeaveRequestDialog}
        onClose={() => {
          setShowLeaveRequestDialog(false);
        }}
        leaveRequest={null}
        onLeaveRequestSaved={() => {
          fetchMyLeaveData();
          setShowLeaveRequestDialog(false);
        }}
        isEmployeeView={true}
      />
    </div>
  );
};

export default MyLeave;