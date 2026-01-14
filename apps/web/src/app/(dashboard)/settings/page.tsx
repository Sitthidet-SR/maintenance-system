'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Bell, Shield, Palette, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { apiPost, apiDelete, apiPatch } from '@/lib/api';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t, locale, setLocale } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Profile settings
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [ticketUpdates, setTicketUpdates] = useState(true);
  const [newAssignments, setNewAssignments] = useState(true);

  // Appearance settings - using next-themes
  const { theme, setTheme } = useTheme();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await apiPatch<{ success: boolean }>('/auth/profile', {
        name,
        phone,
      });
      if (response.success) {
        toast.success('บันทึกข้อมูลโปรไฟล์สำเร็จ');
      }
    } catch (error) {
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(t.common.success);
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await apiPost<{ success: boolean }>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (response.success) {
        toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast.error(error?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await apiDelete<{ success: boolean }>('/auth/delete-account');
      if (response.success) {
        toast.success('ลบบัญชีสำเร็จ');
        logout();
        router.push('/login');
      }
    } catch (error) {
      toast.error('ไม่สามารถลบบัญชีได้');
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.settings.title}</h1>
        <p className="text-muted-foreground">
          {t.settings.subtitle}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            {t.settings.tabs.profile}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            {t.settings.tabs.notifications}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            {t.settings.tabs.appearance}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            {t.settings.tabs.security}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.profile.title}</CardTitle>
              <CardDescription>
                {t.settings.profile.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.settings.profile.fullName}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.profile.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.settings.profile.phone}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+66 XX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.settings.profile.role}</Label>
                  <Input value={user?.role || 'USER'} disabled />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.settings.profile.saving}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t.settings.profile.saveChanges}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.notifications.title}</CardTitle>
              <CardDescription>
                {t.settings.notifications.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.settings.notifications.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.notifications.emailDesc}
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.settings.notifications.push}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.notifications.pushDesc}
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.settings.notifications.ticketUpdates}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.notifications.ticketUpdatesDesc}
                    </p>
                  </div>
                  <Switch
                    checked={ticketUpdates}
                    onCheckedChange={setTicketUpdates}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t.settings.notifications.newAssignments}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.notifications.newAssignmentsDesc}
                    </p>
                  </div>
                  <Switch
                    checked={newAssignments}
                    onCheckedChange={setNewAssignments}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {t.settings.notifications.savePreferences}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.appearance.title}</CardTitle>
              <CardDescription>
                {t.settings.appearance.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.settings.appearance.theme}</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t.settings.appearance.themeLight}</SelectItem>
                      <SelectItem value="dark">{t.settings.appearance.themeDark}</SelectItem>
                      <SelectItem value="system">{t.settings.appearance.themeSystem}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.settings.appearance.language}</Label>
                  <Select value={locale} onValueChange={(val) => setLocale(val as 'th' | 'en')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="th">ไทย</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.security.title}</CardTitle>
              <CardDescription>
                {t.settings.security.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{t.settings.security.changePassword}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.settings.security.changePasswordDesc}
                  </p>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">{t.settings.security.currentPassword}</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">{t.settings.security.newPassword}</Label>
                      <Input 
                        id="new-password" 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">{t.settings.security.confirmNewPassword}</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t.settings.security.updatePassword}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="font-medium text-destructive">{t.settings.security.dangerZone}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t.settings.security.dangerZoneDesc}
                  </p>
                  <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">{t.settings.security.deleteAccount}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ยืนยันการลบบัญชี</DialogTitle>
                        <DialogDescription>
                          การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดของคุณจะถูกลบออกจากระบบ
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                          ยกเลิก
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                        >
                          {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          ลบบัญชี
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
