'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuthStore, useTicketStore } from '@/stores';
import { apiGet } from '@/lib/api';
import { Ticket } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Stats interface
interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  pending: number; // Ensuring we handle 'pending' if API returns it, or map 'open' to it
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { tickets, fetchTickets, isLoading } = useTicketStore();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    pending: 0
  });

  const { t } = useLanguage();

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [fetchTickets]);

  const fetchStats = async () => {
    try {
      const response = await apiGet<{ success: boolean; data: DashboardStats }>('/tickets/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80 border-0">{t.ticket.statuses.RESOLVED}</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 border-0">{t.ticket.statuses.IN_PROGRESS}</Badge>;
      case 'PENDING':
      case 'OPEN':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100/80 border-0">{t.ticket.statuses.PENDING}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-0 shadow-none font-medium">{t.ticket.priorities.HIGH}</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0 shadow-none font-medium">{t.ticket.priorities.MEDIUM}</Badge>;
      case 'LOW':
        return <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-0 shadow-none font-medium">{t.ticket.priorities.LOW}</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, description, trend, className }: any) => (
    <Card className={cn("border-none shadow-sm transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8 p-8 min-h-full bg-slate-50/50 dark:bg-background/50">
      {/* Header Section */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" className="bg-white shadow-sm border-slate-200">
            <Filter className="mr-2 h-4 w-4" /> {t.common.filter}
          </Button>
          <Link href="/tickets/create">
            <Button className="shadow-sm bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> {t.dashboard.createTicket}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t.dashboard.stats.total}
          value={stats.total}
          icon={BarChart3}
          description={t.dashboard.stats.totalDesc}
          className="bg-white dark:bg-card"
        />
        <StatsCard
          title={t.dashboard.stats.pending}
          value={(stats.open || 0) + (stats.pending || 0)}
          icon={AlertCircle}
          description={t.dashboard.stats.pendingDesc}
          className="bg-white dark:bg-card border-l-4 border-l-red-500/50"
        />
        <StatsCard
          title={t.dashboard.stats.inProgress}
          value={stats.inProgress}
          icon={Clock}
          description={t.dashboard.stats.inProgressDesc}
          className="bg-white dark:bg-card border-l-4 border-l-yellow-500/50"
        />
        <StatsCard
          title={t.dashboard.stats.completed}
          value={stats.resolved}
          icon={CheckCircle2}
          description={t.dashboard.stats.completedDesc}
          className="bg-white dark:bg-card border-l-4 border-l-green-500/50"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart - Status Distribution */}
        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader>
            <CardTitle className="text-lg">สถานะงานแจ้งซ่อม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'รอดำเนินการ', value: (stats.open || 0) + (stats.pending || 0), color: '#ef4444' },
                      { name: 'กำลังดำเนินการ', value: stats.inProgress || 0, color: '#f59e0b' },
                      { name: 'เสร็จสิ้น', value: stats.resolved || 0, color: '#22c55e' },
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {[
                      { name: 'รอดำเนินการ', value: (stats.open || 0) + (stats.pending || 0), color: '#ef4444' },
                      { name: 'กำลังดำเนินการ', value: stats.inProgress || 0, color: '#f59e0b' },
                      { name: 'เสร็จสิ้น', value: stats.resolved || 0, color: '#22c55e' },
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Status Breakdown */}
        <Card className="border-none shadow-sm bg-white dark:bg-card">
          <CardHeader>
            <CardTitle className="text-lg">สรุปตามสถานะ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'รอดำเนินการ', value: (stats.open || 0) + (stats.pending || 0), fill: '#ef4444' },
                    { name: 'กำลังดำเนินการ', value: stats.inProgress || 0, fill: '#f59e0b' },
                    { name: 'เสร็จสิ้น', value: stats.resolved || 0, fill: '#22c55e' },
                  ]}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" barSize={30} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Table */}
      <Card className="border-none shadow-sm bg-white dark:bg-card overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border/40">
           <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{t.dashboard.recentRequests}</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t.common.search} className="pl-8 bg-slate-50 border-none" />
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-muted/20">
              <TableRow>
                <TableHead className="w-[100px]">{t.dashboard.table.id}</TableHead>
                <TableHead>{t.dashboard.table.requester}</TableHead>
                <TableHead>{t.dashboard.table.issueType}</TableHead>
                <TableHead>{t.dashboard.table.priority}</TableHead>
                <TableHead>{t.dashboard.table.status}</TableHead>
                <TableHead>{t.dashboard.table.date}</TableHead>
                <TableHead className="text-right">{t.dashboard.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton
                 [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell className="text-right"><div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                    </TableRow>
                 ))
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {t.dashboard.table.noResults}
                  </TableCell>
                </TableRow>
              ) : (
                tickets.slice(0, 10).map((ticket) => (
                  <TableRow key={ticket.id} className="group hover:bg-slate-50/50 dark:hover:bg-muted/10 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">#{ticket.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{ticket.createdBy?.name || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{ticket.createdBy?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal rounded-full">
                        {t.ticket.categories[ticket.category] || ticket.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                             <Link href={`/tickets/${ticket.id}`} className="flex items-center cursor-pointer">
                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                {t.common.view}
                             </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>{t.common.edit}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
