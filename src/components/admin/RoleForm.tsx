/** @jsxImportSource react */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { api, Role, Permission } from "@/lib/api";
import { Loader2, Plus, X, Shield, Users, Package, ShoppingCart, FileText, Settings, Key } from "lucide-react";

interface RoleFormProps {
  role?: Role;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
}

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100, "Role name cannot exceed 100 characters"),
  nameEn: z.string().max(100, "English name cannot exceed 100 characters").optional(),
  nameJa: z.string().max(100, "Japanese name cannot exceed 100 characters").optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  descriptionEn: z.string().max(500, "English description cannot exceed 500 characters").optional(),
  descriptionJa: z.string().max(500, "Japanese description cannot exceed 500 characters").optional(),
  level: z.number().min(0, "Level must be at least 0").max(100, "Level cannot exceed 100"),
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false),
  permissions: z.array(z.string()).default([])
});

type RoleFormData = z.infer<typeof roleSchema>;

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

export default function RoleForm({ role, mode, onSuccess, onCancel }: RoleFormProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      nameJa: "",
      description: "",
      descriptionEn: "",
      descriptionJa: "",
      level: 10,
      isActive: true,
      isSystem: false,
      permissions: []
    }
  });

  const watchedPermissions = watch("permissions");

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const response = await api.getPermissions();
        setPermissions(response.permissions);
      } catch (error) {
        console.error('Error loading permissions:', error);
        toast({
          title: "Error",
          description: "Failed to load permissions",
          variant: "destructive",
        });
      } finally {
        setLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, [toast]);

  // Initialize form with role data
  useEffect(() => {
    if (role && mode === 'edit') {
      reset({
        name: role.name,
        nameEn: role.nameEn || "",
        nameJa: role.nameJa || "",
        description: role.description || "",
        descriptionEn: role.descriptionEn || "",
        descriptionJa: role.descriptionJa || "",
        level: role.level,
        isActive: role.isActive,
        isSystem: role.isSystem,
        permissions: role.permissions.map(p => p._id)
      });
    }
  }, [role, mode, reset]);

  const onSubmit = async (data: RoleFormData) => {
    try {
      setIsLoading(true);
      
      if (mode === 'create') {
        await api.createRole({
          ...data,
          permissions: data.permissions.map(id => ({ _id: id } as Permission))
        });
        toast({
          title: "Success",
          description: "Role created successfully",
        });
      } else if (role) {
        await api.updateRole(role._id, {
          ...data,
          permissions: data.permissions.map(id => ({ _id: id } as Permission))
        });
        toast({
          title: "Success", 
          description: "Role updated successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving role:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    const currentPermissions = watchedPermissions || [];
    const newPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter(id => id !== permissionId)
      : [...currentPermissions, permissionId];
    
    setValue("permissions", newPermissions);
  };

  const handleSelectAllInCategory = (categoryPermissions: string[]) => {
    const currentPermissions = watchedPermissions || [];
    const allSelected = categoryPermissions.every(id => currentPermissions.includes(id));
    
    if (allSelected) {
      // Deselect all in category
      const newPermissions = currentPermissions.filter(id => !categoryPermissions.includes(id));
      setValue("permissions", newPermissions);
    } else {
      // Select all in category
      const newPermissions = [...new Set([...currentPermissions, ...categoryPermissions])];
      setValue("permissions", newPermissions);
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

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter role name"
                className="w-full"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Role Level *</Label>
              <Input
                id="level"
                type="number"
                min="0"
                max="100"
                {...register("level", { valueAsNumber: true })}
                placeholder="Enter role level (0-100)"
                className="w-full"
              />
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name</Label>
              <Input
                id="nameEn"
                {...register("nameEn")}
                placeholder="Enter English name"
                className="w-full"
              />
              {errors.nameEn && (
                <p className="text-sm text-red-500">{errors.nameEn.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nameJa">Japanese Name</Label>
              <Input
                id="nameJa"
                {...register("nameJa")}
                placeholder="Enter Japanese name"
                className="w-full"
              />
              {errors.nameJa && (
                <p className="text-sm text-red-500">{errors.nameJa.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Enter role description"
                className="w-full"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">English Description</Label>
              <Textarea
                id="descriptionEn"
                {...register("descriptionEn")}
                placeholder="Enter English description"
                rows={3}
                className="w-full"
              />
              {errors.descriptionEn && (
                <p className="text-sm text-red-500">{errors.descriptionEn.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descriptionJa">Japanese Description</Label>
              <Textarea
                id="descriptionJa"
                {...register("descriptionJa")}
                placeholder="Enter Japanese description"
                rows={3}
                className="w-full"
              />
              {errors.descriptionJa && (
                <p className="text-sm text-red-500">{errors.descriptionJa.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isSystem"
                checked={watch("isSystem")}
                onCheckedChange={(checked) => setValue("isSystem", checked)}
              />
              <Label htmlFor="isSystem">System Role</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the permissions for this role. You can select all permissions in a category or individual permissions.
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-8 pr-4">
              {permissionCategories.map((category, categoryIndex) => {
                const categoryPermissions = category.permissions.map(p => 
                  permissions.find(perm => perm.resource === p.resource && perm.action === p.action)?._id
                ).filter(Boolean) as string[];
                
                const selectedInCategory = categoryPermissions.filter(id => 
                  watchedPermissions?.includes(id)
                ).length;
                
                const allSelected = selectedInCategory === categoryPermissions.length;
                const someSelected = selectedInCategory > 0;

                return (
                  <div key={categoryIndex} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <category.icon className="h-4 w-4" />
                        <h4 className="font-medium">{getCategoryTitle(category)}</h4>
                        <Badge variant={allSelected ? "default" : someSelected ? "secondary" : "outline"}>
                          {selectedInCategory}/{categoryPermissions.length}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllInCategory(categoryPermissions)}
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-6">
                      {category.permissions.map((permission, permIndex) => {
                        const fullPermission = permissions.find(p => 
                          p.resource === permission.resource && p.action === permission.action
                        );
                        
                        if (!fullPermission) return null;
                        
                        return (
                          <div key={permIndex} className="flex items-center space-x-2">
                            <Checkbox
                              id={`permission-${fullPermission._id}`}
                              checked={watchedPermissions?.includes(fullPermission._id) || false}
                              onCheckedChange={() => handlePermissionToggle(fullPermission._id)}
                            />
                            <Label 
                              htmlFor={`permission-${fullPermission._id}`}
                              className="text-sm cursor-pointer"
                            >
                              {getPermissionName(permission)}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                    
                    {categoryIndex < permissionCategories.length - 1 && (
                      <Separator />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Selected Permissions:</strong> {watchedPermissions?.length || 0} permissions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="px-8">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Role' : 'Update Role'}
        </Button>
      </div>
      </form>
    </div>
  );
}
