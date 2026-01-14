'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Type, 
  FileText,
  Tag,
  Save
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { apiGet, apiPatch } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';

const editTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.enum(['ELECTRICAL', 'PLUMBING', 'HVAC', 'IT', 'GENERAL', 'OTHER']),
  location: z.string().min(2, 'Location is required'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED']),
});

type EditTicketForm = z.infer<typeof editTicketSchema>;

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  location: string;
}

interface EditTicketPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTicketPage({ params }: EditTicketPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditTicketForm>({
    resolver: zodResolver(editTicketSchema),
  });

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await apiGet<{ success: boolean; data: Ticket }>(`/tickets/${id}`);
        if (response.success) {
          const ticket = response.data;
          reset({
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority as EditTicketForm['priority'],
            category: ticket.category as EditTicketForm['category'],
            location: ticket.location,
            status: ticket.status as EditTicketForm['status'],
          });
        }
      } catch (error) {
        toast.error('ไม่สามารถโหลดข้อมูลได้');
        router.push('/tickets');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();
  }, [id, reset, router]);

  const onSubmit = async (data: EditTicketForm) => {
    setIsSubmitting(true);
    try {
      await apiPatch(`/tickets/${id}`, data);
      toast.success('บันทึกการแก้ไขสำเร็จ');
      router.push(`/tickets/${id}`);
    } catch {
      toast.error('ไม่สามารถบันทึกได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 dark:from-background dark:to-muted/30 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Back Button */}
        <Link href={`/tickets/${id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.common.back}
        </Link>
        
        <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white dark:bg-card">
          <div className="h-2 w-full bg-linear-to-r from-amber-500 to-orange-500" />
          <CardHeader className="space-y-1 text-center sm:text-left pt-8 px-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
              แก้ไขรายการแจ้งซ่อม
            </CardTitle>
            <CardDescription className="text-base">
              แก้ไขข้อมูลรายการแจ้งซ่อม #{id.slice(0, 8)}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Title Input */}
              <div className="space-y-2 group">
                <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" /> {t.ticket.form.title}
                </Label>
                <Input
                  id="title"
                  placeholder={t.ticket.form.titlePlaceholder}
                  {...register('title')}
                  className={`h-12 pl-4 transition-all focus-visible:ring-primary/20 ${errors.title ? 'border-destructive' : 'hover:border-primary/50'}`}
                />
                {errors.title && (
                  <p className="text-xs text-destructive font-medium">{errors.title.message}</p>
                )}
              </div>

              {/* Status & Priority */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">สถานะ</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as EditTicketForm['status'])}
                  >
                    <SelectTrigger className="h-11">
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
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">ความสำคัญ</Label>
                  <Select
                    value={watch('priority')}
                    onValueChange={(value) => setValue('priority', value as EditTicketForm['priority'])}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">ต่ำ</SelectItem>
                      <SelectItem value="MEDIUM">ปานกลาง</SelectItem>
                      <SelectItem value="HIGH">สูง</SelectItem>
                      <SelectItem value="CRITICAL">วิกฤต</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location & Category */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {t.ticket.form.location}
                  </Label>
                  <Input
                    id="location"
                    placeholder={t.ticket.form.locationPlaceholder}
                    {...register('location')}
                    className={`h-11 ${errors.location ? 'border-destructive' : 'hover:border-primary/50'}`}
                  />
                  {errors.location && (
                    <p className="text-xs text-destructive font-medium">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> {t.ticket.form.category}
                  </Label>
                  <Select
                    value={watch('category')}
                    onValueChange={(value) => setValue('category', value as EditTicketForm['category'])}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ELECTRICAL">{t.ticket.categories.ELECTRICAL}</SelectItem>
                      <SelectItem value="PLUMBING">{t.ticket.categories.PLUMBING}</SelectItem>
                      <SelectItem value="HVAC">{t.ticket.categories.HVAC}</SelectItem>
                      <SelectItem value="IT">{t.ticket.categories.IT}</SelectItem>
                      <SelectItem value="GENERAL">{t.ticket.categories.GENERAL}</SelectItem>
                      <SelectItem value="OTHER">{t.ticket.categories.OTHER}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> {t.ticket.form.description}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t.ticket.form.descriptionPlaceholder}
                  rows={5}
                  {...register('description')}
                  className={`resize-none p-4 ${errors.description ? 'border-destructive' : 'hover:border-primary/50'}`}
                />
                {errors.description && (
                  <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  size="lg" 
                  className="flex-1 h-12"
                  onClick={() => router.push(`/tickets/${id}`)}
                >
                  ยกเลิก
                </Button>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1 h-12 text-base font-semibold shadow-lg shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      บันทึกการแก้ไข
                    </>
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
