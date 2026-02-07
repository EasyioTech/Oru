/**
 * Integrations Page
 * Complete integration hub management interface
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Plug,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  Eye,
  Key,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  RefreshCw,
  Shield,
  Clock,
} from 'lucide-react';
import {
  getIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  getIntegrationLogs,
  getIntegrationStats,
  testIntegration,
  syncIntegration,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  type Integration as IntegrationType,
  type IntegrationLog,
  type ApiKey,
  type IntegrationStats,
} from '@/services/api/integrations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IntegrationStatsCard,
  IntegrationFormDialog,
  IntegrationViewDialog,
  ApiKeyCreateDialog,
  ApiKeyViewDialog,
} from './components';

export default function Integrations() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('integrations');
  const [integrations, setIntegrations] = useState<IntegrationType[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLogType, setFilterLogType] = useState<string>('all');
  const [filterLogStatus, setFilterLogStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isViewApiKeyDialogOpen, setIsViewApiKeyDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [formData, setFormData] = useState<Partial<IntegrationType>>({
    name: '',
    integration_type: 'api',
    provider: '',
    description: '',
    status: 'inactive',
    webhook_url: '',
    api_endpoint: '',
    authentication_type: 'api_key',
    sync_enabled: false,
    sync_frequency: 'manual',
    configuration: {},
  });

  const [apiKeyFormData, setApiKeyFormData] = useState({
    name: '',
    permissions: {} as Record<string, unknown>,
    rateLimitPerMinute: 60,
    rateLimitPerHour: 1000,
    rateLimitPerDay: 10000,
    expiresAt: '',
    prefix: 'sk_live',
  });

  useEffect(() => {
    loadData();
  }, [activeTab, filterType, filterStatus, filterLogType, filterLogStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'integrations') {
        const filters: Record<string, string> = {};
        if (filterType !== 'all') filters.integration_type = filterType;
        if (filterStatus !== 'all') filters.status = filterStatus;
        if (searchTerm) filters.search = searchTerm;

        const [integrationsData, statsData] = await Promise.all([
          getIntegrations(filters),
          getIntegrationStats(),
        ]);
        setIntegrations(integrationsData);
        setStats(statsData);
      } else if (activeTab === 'api-keys') {
        const keysData = await getApiKeys();
        setApiKeys(keysData);
      } else if (activeTab === 'logs') {
        const filters: Record<string, string | number> = {};
        if (filterLogType !== 'all') filters.log_type = filterLogType;
        if (filterLogStatus !== 'all') filters.status = filterLogStatus;
        filters.limit = 100;

        const logsData = await getIntegrationLogs(undefined, filters);
        setLogs(logsData);
      }
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      integration_type: 'api',
      provider: '',
      description: '',
      status: 'inactive',
      webhook_url: '',
      api_endpoint: '',
      authentication_type: 'api_key',
      sync_enabled: false,
      sync_frequency: 'manual',
      configuration: {},
    });
    setSelectedIntegration(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (integration: IntegrationType) => {
    setFormData({ ...integration });
    setSelectedIntegration(integration);
    setIsDialogOpen(true);
  };

  const handleView = async (integration: IntegrationType) => {
    try {
      const fullIntegration = await getIntegrationById(integration.id);
      setSelectedIntegration(fullIntegration);
      setIsViewDialogOpen(true);
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to load integration details',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (selectedIntegration) {
        await updateIntegration(selectedIntegration.id, formData);
        toast({ title: 'Success', description: 'Integration updated successfully' });
      } else {
        await createIntegration(formData);
        toast({ title: 'Success', description: 'Integration created successfully' });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to save integration',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (integration: IntegrationType) => {
    if (!confirm(`Are you sure you want to delete "${integration.name}"?`)) return;
    try {
      await deleteIntegration(integration.id);
      toast({ title: 'Success', description: 'Integration deleted successfully' });
      loadData();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to delete integration',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async (integration: IntegrationType) => {
    try {
      setIsTesting(true);
      const result = await testIntegration(integration.id);
      toast({
        title: 'Test Result',
        description: result.message || 'Connection test completed',
        variant: result.status === 'success' ? 'default' : 'destructive',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to test integration',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSync = async (integration: IntegrationType) => {
    try {
      setIsSyncing(true);
      await syncIntegration(integration.id);
      toast({ title: 'Success', description: 'Sync triggered successfully' });
      loadData();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to sync integration',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateApiKey = () => {
    setApiKeyFormData({
      name: '',
      permissions: {},
      rateLimitPerMinute: 60,
      rateLimitPerHour: 1000,
      rateLimitPerDay: 10000,
      expiresAt: '',
      prefix: 'sk_live',
    });
    setNewApiKey('');
    setSelectedApiKey(null);
    setIsApiKeyDialogOpen(true);
  };

  const handleSubmitApiKey = async () => {
    try {
      setIsSubmitting(true);
      const result = await createApiKey(apiKeyFormData);
      setNewApiKey(result.key || '');
      setSelectedApiKey(result as ApiKey);
      toast({
        title: 'Success',
        description: 'API key created successfully. Copy it now - it will not be shown again.',
      });
      loadData();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeApiKey = async (key: ApiKey) => {
    if (!confirm(`Are you sure you want to revoke "${key.name}"?`)) return;
    try {
      await revokeApiKey(key.id);
      toast({ title: 'Success', description: 'API key revoked successfully' });
      loadData();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to revoke API key',
        variant: 'destructive',
      });
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: 'Copied', description: 'API key copied to clipboard' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      testing: 'outline',
    };
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      active: CheckCircle2,
      inactive: Clock,
      error: XCircle,
      testing: AlertCircle,
    };
    const Icon = icons[status] || AlertCircle;
    return (
      <Badge variant={variants[status] || 'secondary'}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getLogStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      pending: 'secondary',
      error: 'destructive',
      warning: 'outline',
    };
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      success: CheckCircle2,
      pending: Clock,
      error: XCircle,
      warning: AlertCircle,
    };
    const Icon = icons[status] || AlertCircle;
    return (
      <Badge variant={variants[status] || 'secondary'}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">Manage integrations, API keys, and monitor activity</p>
        </div>
      </div>

      {stats && activeTab === 'integrations' && <IntegrationStatsCard stats={stats} />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="w-4 h-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Integrations</CardTitle>
                  <CardDescription>Manage your external integrations</CardDescription>
                </div>
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        loadData();
                      }}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="zapier">Zapier</SelectItem>
                    <SelectItem value="make">Make</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : integrations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No integrations found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sync</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {integrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">{integration.name}</TableCell>
                        <TableCell>{integration.integration_type}</TableCell>
                        <TableCell>{integration.provider || '-'}</TableCell>
                        <TableCell>{getStatusBadge(integration.status)}</TableCell>
                        <TableCell>
                          {integration.sync_enabled ? (
                            <Badge variant="outline">Enabled</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {integration.last_sync_at
                            ? new Date(integration.last_sync_at).toLocaleString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(integration)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTest(integration)}
                              disabled={isTesting}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            {integration.sync_enabled && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSync(integration)}
                                disabled={isSyncing}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(integration)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            {!integration.is_system && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(integration)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for external access</CardDescription>
                </div>
                <Button onClick={handleCreateApiKey}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No API keys found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Prefix</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rate Limits</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{key.prefix}...</code>
                        </TableCell>
                        <TableCell>
                          {key.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Revoked</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {key.rateLimitPerMinute || 60}/min, {key.rateLimitPerHour || 1000}/hr
                        </TableCell>
                        <TableCell>
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedApiKey(key);
                                setIsViewApiKeyDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {key.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeApiKey(key)}
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Integration Logs</CardTitle>
                  <CardDescription>Monitor integration activity and errors</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={filterLogType} onValueChange={setFilterLogType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Log Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sync">Sync</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="api_call">API Call</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterLogStatus} onValueChange={setFilterLogStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No logs found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Integration</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Records</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{log.integration_name || '-'}</TableCell>
                        <TableCell>{log.log_type}</TableCell>
                        <TableCell>{getLogStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          {log.direction ? (
                            <Badge variant="outline">{log.direction}</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {log.execution_time_ms ? `${log.execution_time_ms}ms` : '-'}
                        </TableCell>
                        <TableCell>
                          {log.records_processed
                            ? `${log.records_success || 0}/${log.records_processed}`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <IntegrationFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        selectedIntegration={selectedIntegration}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <IntegrationViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        integration={selectedIntegration}
        getStatusBadge={getStatusBadge}
      />

      <ApiKeyCreateDialog
        open={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
        formData={apiKeyFormData}
        onFormDataChange={setApiKeyFormData}
        newApiKey={newApiKey}
        onSubmit={handleSubmitApiKey}
        onCopyKey={handleCopyApiKey}
        onDone={() => {
          setIsApiKeyDialogOpen(false);
          setNewApiKey('');
        }}
        isSubmitting={isSubmitting}
      />

      <ApiKeyViewDialog
        open={isViewApiKeyDialogOpen}
        onOpenChange={setIsViewApiKeyDialogOpen}
        apiKey={selectedApiKey}
      />
    </div>
  );
}
