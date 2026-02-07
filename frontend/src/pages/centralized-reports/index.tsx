import React, { useState, useEffect } from 'react';
import { Plus, Eye, Loader2, AlertCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ReportService, Report, CustomReport } from '@/services/api/reports';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { selectOne } from '@/services/api/core';
import {
  ReportStatsCards,
  ReportFilters,
  ReportTemplateCard,
  CustomReportCard,
  CreateCustomReportDialog,
  ScheduleReportDialog,
  REPORT_TEMPLATES,
  type ReportTemplate
} from './components';
import {
  generateFinancialReport,
  generateAttendanceReport,
  generatePayrollReport,
  generateLeaveReport,
  generateEmployeeReport,
  generateProjectReport
} from './reportGenerators';

const CentralizedReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const authHook = useAuth();
  const authStore = useAuthStore();
  const user = authHook.user || authStore.user;
  const profile = authHook.profile || authStore.profile;
  const isAuthenticated = authHook.user || authStore.isAuthenticated;
  const { addNotification } = useAppStore();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const [generatedReports, setGeneratedReports] = useState<Report[]>([]);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState({ reports: false, custom: false, generating: false });

  const [createCustomOpen, setCreateCustomOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | CustomReport | null>(null);

  const [newCustomReport, setNewCustomReport] = useState({
    name: '',
    description: '',
    report_type: 'custom' as const
  });
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    day: '1',
    time: '09:00',
    email: profile?.user_id || ''
  });

  const getUserId = (): string | null => {
    if (authHook.user?.id) return authHook.user.id;
    if (authStore.user?.id) return authStore.user.id;
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        let decoded: { userId?: string; email?: string; exp?: number };
        if (token.includes('.')) {
          decoded = JSON.parse(atob(token.split('.')[1]));
        } else {
          decoded = JSON.parse(atob(token));
        }
        if (decoded.userId) return decoded.userId;
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const hasUser = user?.id || (token && token.length > 0);
    if (hasUser) {
      fetchGeneratedReports();
      fetchCustomReports();
    }
  }, [user, isAuthenticated]);

  const fetchGeneratedReports = async () => {
    const userId = getUserId();
    const token = localStorage.getItem('auth_token');
    if (!userId && !token) return;

    setLoading(prev => ({ ...prev, reports: true }));
    try {
      const response = await ReportService.getReports({}, { showLoading: false });
      if (response.success && response.data) {
        setGeneratedReports(response.data);
      } else {
        addNotification({ type: 'error', title: 'Error', message: response.error || 'Failed to load reports' });
      }
    } catch (error: unknown) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: (error as Error).message || 'Failed to load reports'
      });
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const fetchCustomReports = async () => {
    const userId = getUserId();
    const token = localStorage.getItem('auth_token');
    if (!userId && !token) return;

    setLoading(prev => ({ ...prev, custom: true }));
    try {
      const profileData = await selectOne('profiles', { user_id: userId });
      if (profileData?.id) {
        const response = await ReportService.getCustomReports(profileData.id, { showLoading: false });
        if (response.success && response.data) {
          setCustomReports(response.data);
        }
      }
    } catch (error: unknown) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load custom reports: ' + ((error as Error).message || 'Unknown error')
      });
    } finally {
      setLoading(prev => ({ ...prev, custom: false }));
    }
  };

  const getLastGenerated = (templateId: string): string | null => {
    const report = generatedReports
      .filter(r => r.parameters?.templateId === templateId)
      .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())[0];
    return report ? report.generated_at : null;
  };

  const handleGenerateReport = async (template: ReportTemplate) => {
    const userId = getUserId();
    const token = localStorage.getItem('auth_token');
    if (!userId && !token) {
      toast({ title: 'Authentication Required', description: 'You must be logged in to generate reports.', variant: 'destructive' });
      return;
    }
    if (!userId) {
      toast({ title: 'User Not Found', description: 'Unable to identify user. Please refresh the page.', variant: 'destructive' });
      return;
    }

    setLoading(prev => ({ ...prev, generating: true }));
    try {
      const profileData = await selectOne('profiles', { user_id: userId });
      if (!profileData?.id) throw new Error('Profile not found.');

      let reportData: Record<string, unknown> = {};
      const agencyId = profile?.agency_id;

      switch (template.report_type) {
        case 'financial':
          reportData = await generateFinancialReport(template.id, selectedMonth, agencyId);
          break;
        case 'attendance':
          reportData = await generateAttendanceReport(selectedMonth, agencyId);
          break;
        case 'payroll':
          reportData = await generatePayrollReport(selectedMonth, agencyId);
          break;
        case 'leave':
          reportData = await generateLeaveReport(agencyId);
          break;
        case 'employee':
          reportData = await generateEmployeeReport(agencyId);
          break;
        case 'project':
          reportData = await generateProjectReport(agencyId);
          break;
        default:
          reportData = { message: 'Report generated' };
      }

      const reportResponse = await ReportService.createReport({
        name: template.name,
        description: template.description,
        report_type: template.report_type,
        parameters: { templateId: template.id, ...reportData, month: selectedMonth, year: selectedYear },
        generated_by: userId,
        is_public: false
      }, { showLoading: false });

      if (reportResponse.success) {
        toast({ title: 'Success', description: `${template.name} report generated successfully` });
        fetchGeneratedReports();
      } else {
        throw new Error(reportResponse.error || 'Failed to save report');
      }
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to generate report', variant: 'destructive' });
    } finally {
      setLoading(prev => ({ ...prev, generating: false }));
    }
  };

  const handleCreateCustomReport = async () => {
    if (!newCustomReport.name.trim()) {
      toast({ title: 'Error', description: 'Please provide a report name', variant: 'destructive' });
      return;
    }
    const userId = getUserId();
    const token = localStorage.getItem('auth_token');
    if (!userId && !token) {
      toast({ title: 'Authentication Required', description: 'You must be logged in to create reports.', variant: 'destructive' });
      return;
    }

    try {
      const profileData = await selectOne('profiles', { user_id: userId });
      if (!profileData?.id) throw new Error('Profile not found');

      const response = await ReportService.createCustomReport({
        name: newCustomReport.name,
        description: newCustomReport.description,
        report_type: newCustomReport.report_type,
        parameters: {},
        created_by: profileData.id,
        agency_id: profile?.agency_id || undefined
      }, { showLoading: false });

      if (response.success) {
        toast({ title: 'Success', description: 'Custom report created successfully' });
        setCreateCustomOpen(false);
        setNewCustomReport({ name: '', description: '', report_type: 'custom' });
        fetchCustomReports();
      } else {
        throw new Error(response.error || 'Failed to create report');
      }
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to create custom report', variant: 'destructive' });
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    try {
      const response = 'created_by' in selectedReport
        ? await ReportService.deleteCustomReport(selectedReport.id, { showLoading: false })
        : await ReportService.deleteReport(selectedReport.id, { showLoading: false });

      if (response.success) {
        toast({ title: 'Success', description: 'Report deleted successfully' });
        fetchGeneratedReports();
        fetchCustomReports();
      } else {
        throw new Error(response.error || 'Failed to delete report');
      }
    } catch (error: unknown) {
      toast({ title: 'Error', description: (error as Error).message || 'Failed to delete report', variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const getFilteredReports = () => {
    let filtered = [...REPORT_TEMPLATES];
    if (categoryFilter !== 'all') {
      const categoryMap: Record<string, string> = { financial: 'Financial', hr: 'HR', project: 'Project', custom: 'Custom' };
      filtered = filtered.filter(r => r.category === categoryMap[categoryFilter]);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term));
    }
    if (activeTab !== 'all') {
      const tabMap: Record<string, string> = { financial: 'Financial', hr: 'HR', project: 'Project', custom: 'Custom' };
      filtered = filtered.filter(r => r.category === tabMap[activeTab]);
    }
    return filtered;
  };

  const stats = {
    total: REPORT_TEMPLATES.length,
    financial: REPORT_TEMPLATES.filter(r => r.category === 'Financial').length,
    hr: REPORT_TEMPLATES.filter(r => r.category === 'HR').length,
    project: REPORT_TEMPLATES.filter(r => r.category === 'Project').length,
    custom: customReports.length,
    generated: generatedReports.length
  };

  const filteredReports = getFilteredReports();

  const renderTemplateCards = (templates: ReportTemplate[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4">
      {templates.map((template) => (
        <ReportTemplateCard
          key={template.id}
          template={template}
          lastGenerated={getLastGenerated(template.id)}
          onGenerate={() => handleGenerateReport(template)}
          onSchedule={() => { setSelectedTemplate(template); setScheduleDialogOpen(true); }}
          onViewRoute={template.route ? () => navigate(template.route!) : undefined}
          generating={loading.generating}
        />
      ))}
    </div>
  );

  const renderEmptyState = (message: string) => (
    <Card>
      <CardContent className="p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  const renderLoadingState = () => (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Centralized Reports</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Generate, view, and manage all your business reports in one place</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => navigate('/reports')} className="w-full sm:w-auto">
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View All Generated</span>
            <span className="sm:hidden">View Generated</span>
          </Button>
          <Button onClick={() => setCreateCustomOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Custom Report</span>
            <span className="sm:hidden">Create Report</span>
          </Button>
        </div>
      </div>

      <ReportStatsCards stats={stats} />

      <ReportFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All Reports</TabsTrigger>
          <TabsTrigger value="financial" className="text-xs sm:text-sm">Financial</TabsTrigger>
          <TabsTrigger value="hr" className="text-xs sm:text-sm">HR Reports</TabsTrigger>
          <TabsTrigger value="project" className="text-xs sm:text-sm">Project</TabsTrigger>
          <TabsTrigger value="custom" className="text-xs sm:text-sm">Custom ({customReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {loading.reports || loading.custom ? renderLoadingState() : filteredReports.length === 0 ? renderEmptyState('No reports found matching your criteria') : renderTemplateCards(filteredReports)}
        </TabsContent>

        {['financial', 'hr', 'project'].map((tab) => {
          const tabReports = filteredReports.filter(r => r.category.toLowerCase() === tab || (tab === 'hr' && r.category === 'HR'));
          return (
            <TabsContent key={tab} value={tab} className="mt-0">
              {loading.reports || loading.custom ? renderLoadingState() : tabReports.length === 0 ? renderEmptyState(`No ${tab} reports found`) : renderTemplateCards(tabReports)}
            </TabsContent>
          );
        })}

        <TabsContent value="custom" className="mt-0">
          {loading.custom ? renderLoadingState() : customReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No custom reports created yet</p>
                <Button onClick={() => setCreateCustomOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4">
              {customReports.map((report) => (
                <CustomReportCard
                  key={report.id}
                  report={report}
                  onEdit={() => {}}
                  onDelete={() => { setSelectedReport(report); setDeleteDialogOpen(true); }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateCustomReportDialog
        open={createCustomOpen}
        onOpenChange={setCreateCustomOpen}
        name={newCustomReport.name}
        description={newCustomReport.description}
        reportType={newCustomReport.report_type}
        onNameChange={(v) => setNewCustomReport(prev => ({ ...prev, name: v }))}
        onDescriptionChange={(v) => setNewCustomReport(prev => ({ ...prev, description: v }))}
        onReportTypeChange={(v) => setNewCustomReport(prev => ({ ...prev, report_type: v as 'custom' }))}
        onSubmit={handleCreateCustomReport}
      />

      <ScheduleReportDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        config={scheduleConfig}
        onConfigChange={setScheduleConfig}
        onSchedule={() => {
          toast({ title: 'Scheduled', description: `Report scheduled for ${scheduleConfig.frequency} generation` });
          setScheduleDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedReport?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CentralizedReports;
