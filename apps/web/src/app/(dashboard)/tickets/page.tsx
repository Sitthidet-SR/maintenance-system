'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { useTicketStore } from '@/stores';
import { TicketStatus, TicketPriority } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  PENDING: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  RESOLVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  CLOSED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-500/10 text-slate-500',
  MEDIUM: 'bg-blue-500/10 text-blue-500',
  HIGH: 'bg-orange-500/10 text-orange-500',
  CRITICAL: 'bg-red-500/10 text-red-500',
};

export default function TicketsPage() {
  const { tickets, isLoading, fetchTickets, setFilters, filters } = useTicketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, search: searchQuery });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setFilters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value === 'all' ? undefined : value as TicketStatus });
  };

  const handlePriorityChange = (value: string) => {
    setFilters({ ...filters, priority: value === 'all' ? undefined : value as TicketPriority });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.ticketList.title}</h1>
          <p className="text-muted-foreground">
            {t.ticketList.subtitle}
          </p>
        </div>
        <Link href="/tickets/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t.ticketList.newTicket}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t.ticketList.filters}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.ticketList.searchPlaceholder}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t.dashboard.table.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.ticketList.allStatus}</SelectItem>
                <SelectItem value="OPEN">{t.ticket.statuses.OPEN}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t.ticket.statuses.IN_PROGRESS}</SelectItem>
                <SelectItem value="PENDING">{t.ticket.statuses.PENDING}</SelectItem>
                <SelectItem value="RESOLVED">{t.ticket.statuses.RESOLVED}</SelectItem>
                <SelectItem value="CLOSED">{t.ticket.statuses.CLOSED}</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.priority || 'all'} 
              onValueChange={handlePriorityChange}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t.dashboard.table.priority} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.ticketList.allPriority}</SelectItem>
                <SelectItem value="LOW">{t.ticket.priorities.LOW}</SelectItem>
                <SelectItem value="MEDIUM">{t.ticket.priorities.MEDIUM}</SelectItem>
                <SelectItem value="HIGH">{t.ticket.priorities.HIGH}</SelectItem>
                <SelectItem value="CRITICAL">{t.ticket.priorities.CRITICAL}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.ticketList.allTickets}</CardTitle>
          <CardDescription>
            {tickets.length} {t.ticketList.ticketsFound}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[400px]">
                    <Button variant="ghost" className="gap-1 -ml-4">
                      {t.ticketList.title_col}
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>{t.dashboard.table.status}</TableHead>
                  <TableHead>{t.dashboard.table.priority}</TableHead>
                  <TableHead>{t.ticket.form.category}</TableHead>
                  <TableHead>{t.ticketList.assignedTo}</TableHead>
                  <TableHead>{t.ticketList.created}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t.ticketList.loading}
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t.ticketList.noTickets}
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">
                        <Link href={`/tickets/${ticket.id}`} className="hover:text-primary">
                          {ticket.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[ticket.status]}>
                          {t.ticket.statuses[ticket.status as keyof typeof t.ticket.statuses]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={priorityColors[ticket.priority]}>
                          {t.ticket.priorities[ticket.priority as keyof typeof t.ticket.priorities]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {t.ticket.categories[ticket.category as keyof typeof t.ticket.categories]}
                      </TableCell>
                      <TableCell>
                        {ticket.assignedTo?.name || (
                          <span className="text-muted-foreground">{t.ticketList.unassigned}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">{t.dashboard.table.actions}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t.dashboard.table.actions}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/tickets/${ticket.id}`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                {t.common.view}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Pencil className="h-4 w-4" />
                              {t.common.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                              <Trash2 className="h-4 w-4" />
                              {t.common.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
