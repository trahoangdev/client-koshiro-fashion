import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { api, Permission } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle,
  XCircle,
  Shield,
  Key
} from "lucide-react";

export default function PermissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [permission, setPermission] = useState<Permission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load permission data
  useEffect(() => {
    const loadPermission = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await api.getPermission(id);
        setPermission(response.permission);
      } catch (error) {
        console.error('Error loading permission:', error);
        toast({
          title: "Error",
          description: "Failed to load permission details",
          variant: "destructive",
        });
        navigate("/admin/roles");
      } finally {
        setIsLoading(false);
      }
    };

    loadPermission();
  }, [id, navigate, toast]);

  const handleDelete = async () => {
    if (!permission) return;
    
    try {
      setIsDeleting(true);
      await api.deletePermission(permission._id);
      toast({
        title: "Success",
        description: "Permission deleted successfully",
      });
      navigate("/admin/roles");
    } catch (error) {
      console.error('Error deleting permission:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete permission",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
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

  if (!permission) {
    return (
      <AdminLayout>
        <div className="p-6">
          <p>Permission not found</p>
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
              <h1 className="text-2xl font-bold">{permission.name}</h1>
              <p className="text-muted-foreground">Permission Details</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate(`/admin/permissions/${permission._id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            {!permission.isSystem && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Permission</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete the permission "{permission.name}"? This action cannot be undone.
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Permission Information */}
          <Card>
            <CardHeader>
              <CardTitle>Permission Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-lg font-semibold">{permission.name}</p>
              </div>
              
              {permission.nameEn && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">English Name</Label>
                  <p>{permission.nameEn}</p>
                </div>
              )}
              
              {permission.nameJa && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Japanese Name</Label>
                  <p>{permission.nameJa}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Resource</Label>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <Badge variant="outline">{permission.resource}</Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Action</Label>
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <Badge variant="outline">{permission.action}</Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Permission</Label>
                <Badge variant="default" className="bg-blue-500">
                  {permission.resource}:{permission.action}
                </Badge>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <p>{permission.category}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="flex items-center space-x-2">
                  {permission.isActive ? (
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
                  {permission.isSystem && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
              </div>
              
              {permission.conditions && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Conditions</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm">{permission.conditions}</code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {permission.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm">{permission.description}</p>
                </div>
              )}
              
              {permission.descriptionEn && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">English Description</Label>
                  <p className="text-sm">{permission.descriptionEn}</p>
                </div>
              )}
              
              {permission.descriptionJa && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Japanese Description</Label>
                  <p className="text-sm">{permission.descriptionJa}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
