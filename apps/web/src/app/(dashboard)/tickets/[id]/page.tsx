'use client';

import { useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  MapPin, 
  Tag,
  MessageSquare,
  Paperclip,
  Send,
  MoreHorizontal,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';

// Mock data
const mockTicket = {
  id: '1',
  title: 'Air conditioner not working in Conference Room A',
  description: 'The air conditioner in Conference Room A on the 3rd floor has stopped working. The room temperature is around 30°C which makes it uncomfortable for meetings. We have an important client meeting scheduled for tomorrow and need this fixed urgently.',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  category: 'HVAC',
  location: 'Building A, Floor 3, Conference Room A',
  createdBy: { id: '1', name: 'John Doe', email: 'john@example.com' },
  assignedTo: { id: '2', name: 'Mike Tech', email: 'mike@example.com' },
  createdAt: '2024-01-13T10:30:00Z',
  updatedAt: '2024-01-13T14:00:00Z',
};

const mockComments = [
  {
    id: '1',
    content: 'I\'ve assigned this to Mike from the HVAC team. He will check on it today.',
    user: { id: '3', name: 'Sarah Admin' },
    createdAt: '2024-01-13T11:00:00Z',
  },
  {
    id: '2',
    content: 'I\'m on my way to check the unit. Will update once I diagnose the issue.',
    user: { id: '2', name: 'Mike Tech' },
    createdAt: '2024-01-13T13:30:00Z',
  },
  {
    id: '3',
    content: 'Found the issue - the compressor needs to be replaced. Will order the part and fix it tomorrow morning.',
    user: { id: '2', name: 'Mike Tech' },
    createdAt: '2024-01-13T14:00:00Z',
  },
];

const mockLogs = [
  {
    id: '1',
    action: 'Ticket created',
    user: { name: 'John Doe' },
    createdAt: '2024-01-13T10:30:00Z',
  },
  {
    id: '2',
    action: 'Status changed from OPEN to IN_PROGRESS',
    user: { name: 'Sarah Admin' },
    createdAt: '2024-01-13T11:00:00Z',
  },
  {
    id: '3',
    action: 'Assigned to Mike Tech',
    user: { name: 'Sarah Admin' },
    createdAt: '2024-01-13T11:00:00Z',
  },
];

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

interface TicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = use(params);
  const { user, isTechnician } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [currentStatus, setCurrentStatus] = useState(mockTicket.status);

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus);
    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    toast.success('Comment added!');
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/tickets">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={statusColors[currentStatus]}>
                {currentStatus.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={priorityColors[mockTicket.priority]}>
                {mockTicket.priority}
              </Badge>
              <Badge variant="outline">{mockTicket.category}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {mockTicket.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ticket #{id} • Created {formatDistanceToNow(new Date(mockTicket.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Ticket
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{mockTicket.description}</p>
            </CardContent>
          </Card>

          {/* Comments & Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="comments">
                <TabsList className="mb-4">
                  <TabsTrigger value="comments" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({mockComments.length})
                  </TabsTrigger>
                  <TabsTrigger value="logs" className="gap-2">
                    <Clock className="h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="space-y-4">
                  {/* Comment list */}
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  {/* New comment */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Paperclip className="h-4 w-4" />
                          Attach
                        </Button>
                        <Button size="sm" className="gap-1" onClick={handleAddComment}>
                          <Send className="h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                  {mockLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p>{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          by {log.user.name} • {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update (Technician/Admin only) */}
          {isTechnician() && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created by</p>
                  <p className="text-sm text-muted-foreground">{mockTicket.createdBy.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Assigned to</p>
                  <p className="text-sm text-muted-foreground">
                    {mockTicket.assignedTo?.name || 'Unassigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{mockTicket.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{mockTicket.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last updated</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(mockTicket.updatedAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
