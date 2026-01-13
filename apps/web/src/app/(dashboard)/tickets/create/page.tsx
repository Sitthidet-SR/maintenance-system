'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Loader2, 
  Upload, 
  X, 
  ImageIcon, 
  MapPin, 
  Type, 
  FileText,
  Tag
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
import { apiPost } from '@/lib/api';
import { useLanguage } from '@/components/providers/LanguageProvider';

const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.enum(['ELECTRICAL', 'PLUMBING', 'HVAC', 'IT', 'GENERAL', 'OTHER']),
  location: z.string().min(2, 'Location is required'),
});

type CreateTicketForm = z.infer<typeof createTicketSchema>;

export default function CreateTicketPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTicketForm>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'MEDIUM',
      category: 'GENERAL',
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateTicketForm) => {
    setIsSubmitting(true);
    try {
      // In a real app, handle file uploads separately or as form data
      // For now, we'll just send the JSON data
      await apiPost('/tickets', data);
      
      toast.success(t.common.success);
      router.push('/dashboard');
    } catch {
      toast.error(t.common.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 to-slate-100 dark:from-background dark:to-muted/30 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.common.back}
        </Link>
        
        <Card className="border-none shadow-xl rounded-xl overflow-hidden bg-white dark:bg-card">
          <div className="h-2 w-full bg-linear-to-r from-primary to-violet-500" />
          <CardHeader className="space-y-1 text-center sm:text-left pt-8 px-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t.ticket.createTitle}
            </CardTitle>
            <CardDescription className="text-base">
              {t.ticket.createSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Title Input */}
              <div className="space-y-2 group">
                <Label htmlFor="title" className="text-sm font-medium flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" /> {t.ticket.form.title}
                </Label>
                <div className="relative">
                  <Input
                    id="title"
                    placeholder={t.ticket.form.titlePlaceholder}
                    {...register('title')}
                    className={`h-12 pl-4 transition-all focus-visible:ring-primary/20 ${errors.title ? 'border-destructive focus-visible:ring-destructive/20' : 'hover:border-primary/50'}`}
                  />
                </div>
                {errors.title && (
                  <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.title.message}</p>
                )}
              </div>

              {/* Two Column Grid: Location & Category */}
              <div className="grid sm:grid-cols-2 gap-6">
                 {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {t.ticket.form.location}
                  </Label>
                  <Input
                    id="location"
                    placeholder={t.ticket.form.locationPlaceholder}
                    {...register('location')}
                    className={`h-11 transition-all focus-visible:ring-primary/20 ${errors.location ? 'border-destructive' : 'hover:border-primary/50'}`}
                  />
                  {errors.location && (
                    <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.location.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> {t.ticket.form.category}
                  </Label>
                  <Select
                    defaultValue="GENERAL"
                    onValueChange={(value) => setValue('category', value as CreateTicketForm['category'])}
                  >
                    <SelectTrigger className="h-11 hover:border-primary/50 transition-all focus:ring-primary/20">
                      <SelectValue placeholder={t.ticket.form.categoryPlaceholder} />
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
                  className={`resize-none p-4 transition-all focus-visible:ring-primary/20 ${errors.description ? 'border-destructive' : 'hover:border-primary/50'}`}
                />
                {errors.description && (
                  <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">{errors.description.message}</p>
                )}
              </div>

              {/* Attachments - Drag and Drop */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" /> {t.ticket.form.attachments}
                </Label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out cursor-pointer group
                    ${dragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-muted/10'}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-primary hover:underline">{t.ticket.form.uploadText}</span> {t.ticket.form.dropText}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SVG, PNG, JPG or GIF (max. 10MB)
                    </p>
                  </div>
                </div>

                {/* File Previews */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="relative group border rounded-lg p-3 flex items-center gap-3 bg-slate-50 dark:bg-muted/20 hover:bg-slate-100 dark:hover:bg-muted/40 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-white dark:bg-card border flex items-center justify-center shrink-0">
                          <ImageIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs font-medium truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] hover:shadow-primary/30"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t.ticket.form.submitting}
                  </>
                ) : (
                  t.ticket.form.submit
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
