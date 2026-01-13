'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search,
  MoreHorizontal,
  Shield,
  Mail,
  Trash2,
  Pencil,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { useUserStore } from '@/stores';
import { UserRole } from '@/types';
import { useLanguage } from '@/components/providers/LanguageProvider';

const roleColors: Record<string, string> = {
  USER: 'bg-blue-500/10 text-blue-500',
  TECHNICIAN: 'bg-orange-500/10 text-orange-500',
  ADMIN: 'bg-purple-500/10 text-purple-500',
};

export default function UsersPage() {
  const { users, isLoading, fetchUsers, setFilters, updateUserRole, updateUserDepartment, deleteUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editDeptOpen, setEditDeptOpen] = useState(false);
  const [editDeptUserId, setEditDeptUserId] = useState<string | null>(null);
  const [editDeptValue, setEditDeptValue] = useState('');
  const [isSavingDept, setIsSavingDept] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchQuery });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, setFilters]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      // Toast handled in store
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm(t.users.deleteConfirm)) {
      try {
        await deleteUser(userId);
      } catch (error) {
         // Toast handled in store
      }
    }
  };

  const openEditDepartment = (userId: string, currentDept: string) => {
    setEditDeptUserId(userId);
    setEditDeptValue(currentDept || '');
    setEditDeptOpen(true);
  };

  const handleSaveDepartment = async () => {
    if (!editDeptUserId) return;
    setIsSavingDept(true);
    try {
      await updateUserDepartment(editDeptUserId, editDeptValue);
      setEditDeptOpen(false);
    } catch (error) {
      // Toast handled in store
    } finally {
      setIsSavingDept(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.users.title}</h1>
          <p className="text-muted-foreground">
            {t.users.subtitle}
          </p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t.users.addUser}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.users.addUserTitle}</DialogTitle>
              <DialogDescription>
                {t.users.addUserDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
               <p className="text-sm text-muted-foreground">การสร้างผู้ใช้ควรทำผ่านหน้าลงทะเบียนหรือระบบเชิญชวน</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                {t.common.cancel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Department Dialog */}
      <Dialog open={editDeptOpen} onOpenChange={setEditDeptOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.users.editDepartment}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="department">{t.users.department}</Label>
              <Input
                id="department"
                placeholder={t.users.departmentPlaceholder}
                value={editDeptValue}
                onChange={(e) => setEditDeptValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDeptOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveDepartment} disabled={isSavingDept}>
              {isSavingDept ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.users.totalUsers}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.users.technicians}</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'TECHNICIAN').length}
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t.users.admins}</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === 'ADMIN').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t.users.allUsers}</CardTitle>
              <CardDescription>
                {users.length} {t.users.usersFound}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.users.searchPlaceholder}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.users.user}</TableHead>
                  <TableHead>{t.users.role}</TableHead>
                  <TableHead>{t.users.department}</TableHead>
                  <TableHead>{t.users.joined}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-10 w-32 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-8 w-8 bg-muted rounded animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t.users.noUsers}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={roleColors[user.role]}>
                          {t.users.roles[user.role as keyof typeof t.users.roles]}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t.dashboard.table.actions}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <Mail className="h-4 w-4" />
                              {t.users.sendEmail}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2"
                              onClick={() => openEditDepartment(user.id, user.department || '')}
                            >
                              <Pencil className="h-4 w-4" />
                              {t.users.editDepartment}
                            </DropdownMenuItem>
                            <DropdownMenuLabel className="text-xs text-muted-foreground mt-2">{t.users.changeRole}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'USER')}>{t.users.roles.USER}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'TECHNICIAN')}>{t.users.roles.TECHNICIAN}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'ADMIN')}>{t.users.roles.ADMIN}</DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 gap-2"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              {t.users.deleteUser}
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
