
import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { fetchSystemHealth } from '@/services/api/monitoring';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import {
    Activity,
    Database,
    Server,
    Clock,
    HardDrive,
    Cloud,
    Cpu,
    Layers,
    Wifi,
    Box
} from 'lucide-react';

const SystemHealth = () => {
    const { isSystemSuperAdmin, userRole } = useAuth();
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    if (!isSystemSuperAdmin && userRole !== 'super_admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const loadHealth = async () => {
        try {
            const data = await fetchSystemHealth();
            setHealth(data);
            setError('');
        } catch (err: any) {
            console.error('Failed to load system health:', err);
            // Don't set error immediately on subsequent loads to prevent flashing
            if (loading) setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHealth();
        // Refresh every 10 seconds for more "real-time" feel
        const interval = setInterval(loadHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <div className="text-red-500 font-medium">Error loading system health</div>
                    <p className="text-muted-foreground text-sm">{error}</p>
                    <button onClick={() => { setLoading(true); loadHealth(); }} className="text-primary hover:underline">
                        Retry
                    </button>
                </div>
            </PageContainer>
        );
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    const getPercentage = (part: number, total: number) => {
        if (!total) return 0;
        return Math.min(Math.round((part / total) * 100), 100);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'healthy' || status === 'ready') {
            return <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>;
        }
        if (status === 'degraded') {
            return <Badge variant="secondary" className="bg-yellow-500 text-white hover:bg-yellow-600">Degraded</Badge>;
        }
        return <Badge variant="destructive">Unhealthy</Badge>;
    };

    return (
        <PageContainer>
            <div className="space-y-6 pb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
                        <p className="text-muted-foreground mt-1">
                            Real-time infrastructure monitoring (VPS & Services)
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Live Updates
                    </div>
                </div>

                {/* Top Level Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2 mt-2">
                                <StatusBadge status={health?.status} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Node: {health?.system.nodeVersion}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mt-2">{formatUptime(health?.uptime)}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Platform: {health?.system.platform}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Load Average (1m)</CardTitle>
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mt-2">
                                {health?.system.loadAverage[0].toFixed(2)}
                            </div>
                            <div className="mt-2">
                                <div className="text-xs text-muted-foreground flex justify-between mb-1">
                                    <span>CPUs: {health?.system.cpuCount}</span>
                                    <span>Goal: &lt; {health?.system.cpuCount}</span>
                                </div>
                                <Progress
                                    value={Math.min((health?.system.loadAverage[0] / health?.system.cpuCount) * 100, 100)}
                                    className="h-1.5"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                            <Layers className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mt-2">
                                {getPercentage(health?.system.memory.used, health?.system.memory.total)}%
                            </div>
                            <div className="mt-2">
                                <div className="text-xs text-muted-foreground flex justify-between mb-1">
                                    <span>{formatBytes(health?.system.memory.used)}</span>
                                    <span>{formatBytes(health?.system.memory.total)}</span>
                                </div>
                                <Progress
                                    value={getPercentage(health?.system.memory.used, health?.system.memory.total)}
                                    className="h-1.5"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Infrastructure Services */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold tracking-tight">Infrastructure Services</h3>

                        {/* Database */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    PostgreSQL Database
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">Primary Cluster</div>
                                        <div className="text-xs text-muted-foreground">Managed PostgreSQL</div>
                                    </div>
                                    <StatusBadge status={health?.services.database.status} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Latency</span>
                                        <span className={`font-mono ${health?.services.database.latency > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {health?.services.database.latency}ms
                                        </span>
                                    </div>
                                    <Progress value={Math.min(health?.services.database.latency, 100)} className="h-1.5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Redis */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Server className="h-4 w-4" />
                                    Redis Cache And Queues
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">Cache Layer</div>
                                        <div className="text-xs text-muted-foreground">Session & Data Caching</div>
                                    </div>
                                    <StatusBadge status={health?.services.redis.status} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Latency</span>
                                        <span className={`font-mono ${health?.services.redis.latency > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {health?.services.redis.latency}ms
                                        </span>
                                    </div>
                                    <Progress value={Math.min(health?.services.redis.latency * 2, 100)} className="h-1.5" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cloud Storage */}
                        {health?.services.storage && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Cloud className="h-4 w-4" />
                                        Object Storage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">
                                                {health.services.storage.provider || 'S3 Compatible'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Asset & Document Storage</div>
                                        </div>
                                        <StatusBadge status={health.services.storage.status} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">API Latency</span>
                                            <span className="font-mono">{health.services.storage.latency}ms</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* VPS Resources */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold tracking-tight">VPS Resources</h3>

                        {/* Disk Usage */}
                        {health?.system.disk ? (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <HardDrive className="h-4 w-4" />
                                        Disk Storage
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <div className="text-sm font-medium mb-1">Volume Usage</div>
                                        <div className="text-xs text-muted-foreground break-all font-mono">
                                            {health.system.disk.path}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Used Space</span>
                                                <span className="font-medium">
                                                    {formatBytes(health.system.disk.used)}
                                                    <span className="text-muted-foreground mx-1">/</span>
                                                    {formatBytes(health.system.disk.total)}
                                                </span>
                                            </div>
                                            <Progress
                                                value={getPercentage(health.system.disk.used, health.system.disk.total)}
                                                className="h-2"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="bg-muted/50 p-2 rounded text-center">
                                                <div className="text-xs text-muted-foreground">Free</div>
                                                <div className="font-mono text-sm">{formatBytes(health.system.disk.free)}</div>
                                            </div>
                                            <div className="bg-muted/50 p-2 rounded text-center">
                                                <div className="text-xs text-muted-foreground">Used %</div>
                                                <div className="font-mono text-sm">{getPercentage(health.system.disk.used, health.system.disk.total)}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Disk Storage</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Disk usage information not available.</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Process Metrics */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Box className="h-4 w-4" />
                                    Node.js Process
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground">Heap Used</div>
                                        <div className="text-lg font-bold">
                                            {formatBytes(health?.system.memory.process?.heapUsed || 0)}
                                        </div>
                                        <Progress
                                            value={getPercentage(health?.system.memory.process?.heapUsed || 0, health?.system.memory.process?.heapTotal || 1)}
                                            className="h-1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground">RSS (Physical)</div>
                                        <div className="text-lg font-bold">
                                            {formatBytes(health?.system.memory.process?.rss || 0)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground">External</div>
                                        <div className="text-lg font-bold">
                                            {formatBytes(health?.system.memory.process?.external || 0)}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs text-muted-foreground">Heap Total</div>
                                        <div className="text-lg font-bold">
                                            {formatBytes(health?.system.memory.process?.heapTotal || 0)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default SystemHealth;
