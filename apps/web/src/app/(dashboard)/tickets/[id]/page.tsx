'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Pencil,
  Loader2
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
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { subscribeToTicketUpdates } from '@/lib/socket';

interface TicketUser {
  id: string;
  name: string;
  email: string;
}

interface Comment {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  user?: TicketUser;
  createdAt: string;
}

interface TicketLog {
  id: string;
  ticketId: string;
  action: string;
  oldValue: string;
  newValue: string;
  userId: string;
  user?: TicketUser;
  createdAt: string;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  ticketId: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  location: string;
  createdById: string;
  assignedToId?: string;
  createdBy?: TicketUser;
  assignedTo?: TicketUser;
  createdAt: string;
  updatedAt: string;
}

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
  const router = useRouter();
  const { user, isTechnician } = useAuthStore();
  const { t } = useLanguage();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [logs, setLogs] = useState<TicketLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [technicians, setTechnicians] = useState<TicketUser[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const response = await apiGet<{ success: boolean; data: Ticket }>(`/tickets/${id}`);
      if (response.success) {
        setTicket(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      toast.error('ไม่สามารถโหลดข้อมูลรายการแจ้งซ่อมได้');
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await apiGet<{ success: boolean; data: Comment[] }>(`/tickets/${id}/comments`);
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }, [id]);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await apiGet<{ success: boolean; data: TicketLog[] }>(`/tickets/${id}/logs`);
      if (response.success) {
        setLogs(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }, [id]);

  const fetchAttachments = useCallback(async () => {
    try {
      const response = await apiGet<{ success: boolean; data: Attachment[] }>(`/tickets/${id}/attachments`);
      if (response.success) {
        setAttachments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
    }
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/${id}/attachments`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('อัพโหลดไฟล์สำเร็จ');
        fetchAttachments();
      } else {
        toast.error('ไม่สามารถอัพโหลดไฟล์ได้');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchTicket(), fetchComments(), fetchLogs(), fetchAttachments()]);
      setIsLoading(false);
    };
    loadData();

    // Fetch technicians for assign dropdown
    if (isTechnician()) {
      apiGet<{ success: boolean; data: TicketUser[] }>('/users').then((res) => {
        if (res.success) {
          // Filter to only technicians and admins
          const techs = res.data.filter((u: any) => u.role === 'TECHNICIAN' || u.role === 'ADMIN');
          setTechnicians(techs);
        }
      }).catch(() => {});
    }
  }, [fetchTicket, fetchComments, isTechnician]);

  // Subscribe to realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToTicketUpdates((data) => {
      if (data.ticket?.id === id) {
        setTicket(data.ticket);
      }
      // Refresh comments when ticket is updated
      fetchComments();
    });

    return () => unsubscribe();
  }, [id, fetchComments]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    setIsUpdatingStatus(true);
    try {
      const response = await apiPatch<{ success: boolean }>(`/tickets/${id}`, { status: newStatus });
      if (response.success) {
        setTicket({ ...ticket, status: newStatus });
        toast.success(`สถานะอัปเดตเป็น ${newStatus.replace('_', ' ')}`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSendingComment(true);
    try {
      const response = await apiPost<{ success: boolean; data: Comment }>(`/tickets/${id}/comments`, {
        content: newComment,
      });
      if (response.success) {
        setComments([...comments, response.data]);
        setNewComment('');
        toast.success('เพิ่มความคิดเห็นแล้ว');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('ไม่สามารถเพิ่มความคิดเห็นได้');
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleAssignTechnician = async (techId: string) => {
    if (!ticket) return;
    setIsAssigning(true);
    try {
      const response = await apiPost<{ success: boolean }>(`/tickets/${id}/assign`, {
        technicianId: techId,
      });
      if (response.success) {
        const tech = technicians.find((t) => t.id === techId);
        setTicket({ ...ticket, assignedTo: tech, assignedToId: techId });
        toast.success(`มอบหมายให้ ${tech?.name || 'ช่าง'} เรียบร้อยแล้ว`);
      }
    } catch (error) {
      console.error('Failed to assign technician:', error);
      toast.error('ไม่สามารถมอบหมายงานได้');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">ไม่พบรายการแจ้งซ่อม</p>
        <Link href="/tickets">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับไปรายการ
          </Button>
        </Link>
      </div>
    );
  }

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
              <Badge variant="outline" className={statusColors[ticket.status]}>
                {ticket.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className={priorityColors[ticket.priority]}>
                {ticket.priority}
              </Badge>
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {ticket.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ticket #{ticket.id.slice(0, 8)} • สร้างเมื่อ {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
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
            <DropdownMenuItem className="gap-2" onClick={() => router.push(`/tickets/${id}/edit`)}>
              <Pencil className="h-4 w-4" />
              แก้ไขรายการ
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
              <CardTitle>รายละเอียด</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description || 'ไม่มีรายละเอียด'}</p>
            </CardContent>
          </Card>

          {/* Comments & Activity */}
          <Card>
            <CardHeader>
              <CardTitle>ความคิดเห็น</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Comment list */}
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีความคิดเห็น</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.user?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}

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
                      placeholder="เขียนความคิดเห็น..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        className="gap-1" 
                        onClick={handleAddComment}
                        disabled={isSendingComment || !newComment.trim()}
                      >
                        {isSendingComment ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        ส่ง
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity History */}
          <Card>
            <CardHeader>
              <CardTitle>ประวัติกิจกรรม</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">ยังไม่มีประวัติกิจกรรม</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.action}</p>
                        {(log.oldValue || log.newValue) && (
                          <p className="text-xs text-muted-foreground">
                            {log.oldValue && <span className="line-through">{log.oldValue}</span>}
                            {log.oldValue && log.newValue && ' → '}
                            {log.newValue && <span className="font-medium">{log.newValue}</span>}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          โดย {log.user?.name || 'ไม่ระบุ'} • {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>ไฟล์แนบ</CardTitle>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button variant="outline" size="sm" className="gap-2" asChild disabled={isUploading}>
                  <span>
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                    เพิ่มไฟล์
                  </span>
                </Button>
              </label>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีไฟล์แนบ</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted">
                      <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${attachment.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          {attachment.filename}
                        </a>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update (Technician/Admin only) */}
          {isTechnician() && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">อัปเดตสถานะ</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={ticket.status} 
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">เปิด</SelectItem>
                    <SelectItem value="IN_PROGRESS">กำลังดำเนินการ</SelectItem>
                    <SelectItem value="PENDING">รอดำเนินการ</SelectItem>
                    <SelectItem value="RESOLVED">แก้ไขแล้ว</SelectItem>
                    <SelectItem value="CLOSED">ปิด</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Assign Technician (Admin/Tech only) */}
          {isTechnician() && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">มอบหมายช่าง</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={ticket.assignedToId || ''} 
                  onValueChange={handleAssignTechnician}
                  disabled={isAssigning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกช่าง" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ข้อมูล</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">สร้างโดย</p>
                  <p className="text-sm text-muted-foreground">{ticket.createdBy?.name || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">มอบหมายให้</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.assignedTo?.name || 'ยังไม่มอบหมาย'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">สถานที่</p>
                  <p className="text-sm text-muted-foreground">{ticket.location || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">หมวดหมู่</p>
                  <p className="text-sm text-muted-foreground">{ticket.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">อัปเดตล่าสุด</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ticket.updatedAt), 'MMM d, yyyy h:mm a')}
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
