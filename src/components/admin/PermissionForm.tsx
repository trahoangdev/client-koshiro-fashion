import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { api, Permission } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface PermissionFormProps {
  permission?: Permission;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
}

const permissionSchema = z.object({
  name: z.string().min(1, "Permission name is required").max(100, "Permission name cannot exceed 100 characters"),
  nameEn: z.string().max(100, "English name cannot exceed 100 characters").optional(),
  nameJa: z.string().max(100, "Japanese name cannot exceed 100 characters").optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  descriptionEn: z.string().max(500, "English description cannot exceed 500 characters").optional(),
  descriptionJa: z.string().max(500, "Japanese description cannot exceed 500 characters").optional(),
  resource: z.string().min(1, "Resource is required").max(50, "Resource cannot exceed 50 characters"),
  action: z.string().min(1, "Action is required").max(50, "Action cannot exceed 50 characters"),
  conditions: z.string().optional(),
  category: z.string().min(1, "Category is required").max(100, "Category cannot exceed 100 characters"),
  isActive: z.boolean().default(true),
  isSystem: z.boolean().default(false)
});

type PermissionFormData = z.infer<typeof permissionSchema>;

// Predefined resources and actions
const resources = [
  "users", "roles", "permissions", "products", "categories", "orders", 
  "reports", "analytics", "settings", "notifications", "api", "integrations",
  "inventory", "shipping", "payments", "promotions", "reviews"
];

const actions = [
  "create", "read", "update", "delete", "manage", "approve", "reject", 
  "export", "import", "publish", "unpublish", "archive", "restore"
];

const categories = [
  "User Management",
  "Role & Permission Management", 
  "Product Management",
  "Order Management",
  "Reports & Analytics",
  "System Settings",
  "API & Integration",
  "Inventory Management",
  "Shipping Management",
  "Payment Management",
  "Promotion Management",
  "Review Management"
];

export default function PermissionForm({ permission, mode, onSuccess, onCancel }: PermissionFormProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      nameJa: "",
      description: "",
      descriptionEn: "",
      descriptionJa: "",
      resource: "",
      action: "",
      conditions: "",
      category: "",
      isActive: true,
      isSystem: false
    }
  });

  // Initialize form with permission data
  useEffect(() => {
    if (permission && mode === 'edit') {
      reset({
        name: permission.name,
        nameEn: permission.nameEn || "",
        nameJa: permission.nameJa || "",
        description: permission.description || "",
        descriptionEn: permission.descriptionEn || "",
        descriptionJa: permission.descriptionJa || "",
        resource: permission.resource,
        action: permission.action,
        conditions: permission.conditions || "",
        category: permission.category,
        isActive: permission.isActive,
        isSystem: permission.isSystem
      });
    }
  }, [permission, mode, reset]);

  const onSubmit = async (data: PermissionFormData) => {
    try {
      setIsLoading(true);
      
      if (mode === 'create') {
        await api.createPermission(data);
        toast({
          title: "Success",
          description: "Permission created successfully",
        });
      } else if (permission) {
        await api.updatePermission(permission._id, data);
        toast({
          title: "Success", 
          description: "Permission updated successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving permission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save permission",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Permission Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter permission name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)} value={watch("category")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nameEn">English Name</Label>
              <Input
                id="nameEn"
                {...register("nameEn")}
                placeholder="Enter English name"
              />
              {errors.nameEn && (
                <p className="text-sm text-red-500">{errors.nameEn.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nameJa">Japanese Name</Label>
              <Input
                id="nameJa"
                {...register("nameJa")}
                placeholder="Enter Japanese name"
              />
              {errors.nameJa && (
                <p className="text-sm text-red-500">{errors.nameJa.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter permission description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">English Description</Label>
              <Textarea
                id="descriptionEn"
                {...register("descriptionEn")}
                placeholder="Enter English description"
                rows={3}
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
              />
              {errors.descriptionJa && (
                <p className="text-sm text-red-500">{errors.descriptionJa.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource & Action */}
      <Card>
        <CardHeader>
          <CardTitle>Resource & Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resource">Resource *</Label>
              <Select onValueChange={(value) => setValue("resource", value)} value={watch("resource")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.resource && (
                <p className="text-sm text-red-500">{errors.resource.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="action">Action *</Label>
              <Select onValueChange={(value) => setValue("action", value)} value={watch("action")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.action && (
                <p className="text-sm text-red-500">{errors.action.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Conditions (Optional)</Label>
            <Input
              id="conditions"
              {...register("conditions")}
              placeholder="e.g., { 'owner': '{{userId}}' }"
            />
            <p className="text-xs text-muted-foreground">
              JSON conditions for fine-grained access control
            </p>
            {errors.conditions && (
              <p className="text-sm text-red-500">{errors.conditions.message}</p>
            )}
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Permission:</strong> {watch("resource") && watch("action") ? 
                `${watch("resource")}:${watch("action")}` : 
                "Select resource and action"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Label htmlFor="isSystem">System Permission</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Permission' : 'Update Permission'}
        </Button>
      </div>
    </form>
  );
}
