import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { api, Role, Permission } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy, 
  Shield, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Key,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  // Permission categories with icons
  const permissionCategories = [
    {
      name: "User Management",
      nameEn: "User Management",
      nameJa: "ユーザー管理",
      icon: Users,
      permissions: [
        { resource: "users", action: "create", name: "Create Users" },
        { resource: "users", action: "read", name: "View Users" },
        { resource: "users", action: "update", name: "Edit Users" },
        { resource: "users", action: "delete", name: "Delete Users" },
        { resource: "users", action: "manage", name: "Manage Users" }
      ]
    },
    {
      name: "Role & Permission Management",
      nameEn: "Role & Permission Management", 
      nameJa: "ロール・権限管理",
      icon: Shield,
      permissions: [
        { resource: "roles", action: "create", name: "Create Roles" },
        { resource: "roles", action: "read", name: "View Roles" },
        { resource: "roles", action: "update", name: "Edit Roles" },
        { resource: "roles", action: "delete", name: "Delete Roles" },
        { resource: "roles", action: "manage", name: "Manage Roles" },
        { resource: "permissions", action: "create", name: "Create Permissions" },
        { resource: "permissions", action: "read", name: "View Permissions" },
        { resource: "permissions", action: "update", name: "Edit Permissions" },
        { resource: "permissions", action: "delete", name: "Delete Permissions" },
        { resource: "permissions", action: "manage", name: "Manage Permissions" }
      ]
    },
    {
      name: "Product Management",
      nameEn: "Product Management",
      nameJa: "商品管理",
      icon: Package,
      permissions: [
        { resource: "products", action: "create", name: "Create Products" },
        { resource: "products", action: "read", name: "View Products" },
        { resource: "products", action: "update", name: "Edit Products" },
        { resource: "products", action: "delete", name: "Delete Products" },
        { resource: "products", action: "manage", name: "Manage Products" },
        { resource: "categories", action: "create", name: "Create Categories" },
        { resource: "categories", action: "read", name: "View Categories" },
        { resource: "categories", action: "update", name: "Edit Categories" },
        { resource: "categories", action: "delete", name: "Delete Categories" },
        { resource: "categories", action: "manage", name: "Manage Categories" }
      ]
    },
    {
      name: "Order Management",
      nameEn: "Order Management",
      nameJa: "注文管理",
      icon: ShoppingCart,
      permissions: [
        { resource: "orders", action: "create", name: "Create Orders" },
        { resource: "orders", action: "read", name: "View Orders" },
        { resource: "orders", action: "update", name: "Edit Orders" },
        { resource: "orders", action: "delete", name: "Delete Orders" },
        { resource: "orders", action: "manage", name: "Manage Orders" }
      ]
    },
    {
      name: "Reports & Analytics",
      nameEn: "Reports & Analytics",
      nameJa: "レポート・分析",
      icon: FileText,
      permissions: [
        { resource: "reports", action: "read", name: "View Reports" },
        { resource: "reports", action: "create", name: "Create Reports" },
        { resource: "reports", action: "manage", name: "Manage Reports" },
        { resource: "analytics", action: "read", name: "View Analytics" },
        { resource: "analytics", action: "manage", name: "Manage Analytics" }
      ]
    },
    {
      name: "System Settings",
      nameEn: "System Settings",
      nameJa: "システム設定",
      icon: Settings,
      permissions: [
        { resource: "settings", action: "read", name: "View Settings" },
        { resource: "settings", action: "update", name: "Edit Settings" },
        { resource: "settings", action: "manage", name: "Manage Settings" },
        { resource: "notifications", action: "read", name: "View Notifications" },
        { resource: "notifications", action: "manage", name: "Manage Notifications" }
      ]
    },
    {
      name: "API & Integration",
      nameEn: "API & Integration",
      nameJa: "API・統合",
      icon: Key,
      permissions: [
        { resource: "api", action: "read", name: "View API" },
        { resource: "api", action: "manage", name: "Manage API" },
        { resource: "integrations", action: "read", name: "View Integrations" },
        { resource: "integrations", action: "manage", name: "Manage Integrations" }
      ]
    }
  ];

  // Load role data
  useEffect(() => {
    const loadRole = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await api.getRole(id);
        setRole(response.role);
      } catch (error) {
        console.error('Error loading role:', error);
        toast({
          title: "Error",
          description: "Failed to load role details",
          variant: "destructive",
        });
        navigate("/admin/roles");
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!role) return;
    
    try {
      setIsDeleting(true);
      await api.deleteRole(role._id);
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      navigate("/admin/roles");
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClone = async () => {
    if (!role) return;
    
    try {
      setIsCloning(true);
      const response = await api.cloneRole(role._id, {
        name: `${role.name} (Copy)`,
        nameEn: role.nameEn ? `${role.nameEn} (Copy)` : undefined,
        nameJa: role.nameJa ? `${role.nameJa} (Copy)` : undefined,
        level: role.level
      });
      
      toast({
        title: "Success",
        description: "Role cloned successfully",
      });
      navigate(`/admin/roles/${response.role._id}`);
    } catch (error) {
      console.error('Error cloning role:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clone role",
        variant: "destructive",
      });
    } finally {
      setIsCloning(false);
    }
  };

  const getCategoryTitle = (category: typeof permissionCategories[0]) => {
    switch (language) {
      case 'vi': return category.name;
      case 'ja': return category.nameJa;
      default: return category.nameEn;
    }
  };

  const getPermissionName = (permission: { name: string }) => {
    return permission.name;
  };

  const hasPermission = (resource: string, action: string) => {
    if (!role) return false;
    return role.permissions.some(p => p.resource === resource && p.action === action);
  };

  const getRoleLevelColor = (level: number) => {
    if (level >= 95) return "bg-red-500";
    if (level >= 90) return "bg-orange-500";
    if (level >= 80) return "bg-yellow-500";
    if (level >= 70) return "bg-blue-500";
    if (level >= 60) return "bg-green-500";
    return "bg-gray-500";
  };

  const getRoleLevelText = (level: number) => {
    if (level >= 95) return "Super Admin";
    if (level >= 90) return "Admin";
    if (level >= 80) return "Manager";
    if (level >= 70) return "Editor";
    if (level >= 60) return "Viewer";
    return "Customer";
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!role) {
    return (
      <AdminLayout>
        <div className="p-6">
          <p>Role not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/roles")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roles
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{role.name}</h1>
              <p className="text-muted-foreground">Role Details & Permissions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate(`/admin/roles/${role._id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <Button variant="outline" onClick={handleClone} disabled={isCloning}>
              {isCloning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Clone
            </Button>
            
            {!role.isSystem && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Role</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the role "{role.name}"? This action cannot be undone.
                      {role.userCount && role.userCount > 0 && (
                        <span className="block mt-2 text-red-600">
                          Warning: This role is assigned to {role.userCount} user(s).
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-lg font-semibold">{role.name}</p>
                </div>
                
                {role.nameEn && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">English Name</Label>
                    <p>{role.nameEn}</p>
                  </div>
                )}
                
                {role.nameJa && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Japanese Name</Label>
                    <p>{role.nameJa}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Level</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getRoleLevelColor(role.level)} text-white`}>
                      Level {role.level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({getRoleLevelText(role.level)})
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="flex items-center space-x-2">
                    {role.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {role.isSystem && (
                      <Badge variant="secondary">System</Badge>
                    )}
                  </div>
                </div>
                
                {role.userCount !== undefined && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Users</Label>
                    <p>{role.userCount} user(s) assigned</p>
                  </div>
                )}
                
                {role.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm">{role.description}</p>
                  </div>
                )}
                
                {role.descriptionEn && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">English Description</Label>
                    <p className="text-sm">{role.descriptionEn}</p>
                  </div>
                )}
                
                {role.descriptionJa && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Japanese Description</Label>
                    <p className="text-sm">{role.descriptionJa}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Permissions</span>
                    <Badge variant="outline">{role.permissions.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Categories</span>
                    <Badge variant="outline">
                      {permissionCategories.filter(category => 
                        category.permissions.some(p => hasPermission(p.resource, p.action))
                      ).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed view of all permissions assigned to this role
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {permissionCategories.map((category, categoryIndex) => {
                      const categoryPermissions = category.permissions.filter(p => 
                        hasPermission(p.resource, p.action)
                      );
                      
                      if (categoryPermissions.length === 0) return null;
                      
                      return (
                        <div key={categoryIndex} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <category.icon className="h-4 w-4" />
                            <h4 className="font-medium">{getCategoryTitle(category)}</h4>
                            <Badge variant="outline">{categoryPermissions.length}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                            {categoryPermissions.map((permission, permIndex) => (
                              <div key={permIndex} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{getPermissionName(permission)}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {permission.resource}:{permission.action}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          
                          {categoryIndex < permissionCategories.length - 1 && (
                            <Separator />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
