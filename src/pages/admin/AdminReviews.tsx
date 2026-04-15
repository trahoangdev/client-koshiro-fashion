import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, Review } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Star, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ThumbsUp,
  User,
  Package,
  RefreshCw,
  Download,
  TrendingUp
} from 'lucide-react';

const AdminReviews = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<Array<{_id: string; name: string; email: string}>>([]);
  const [products, setProducts] = useState<Array<{_id: string; name: string; nameEn?: string; nameJa?: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    productId: 'no-product',
    rating: 5,
    title: '',
    comment: '',
    verified: false
  });

  // Translations
  const translations = {
    en: {
      title: "Reviews Management",
      subtitle: "Manage customer reviews and ratings",
      totalReviews: "Total Reviews",
      verifiedReviews: "Verified Reviews", 
      averageRating: "Average Rating",
      recentReviews: "Recent Reviews",
      addReview: "Add Review",
      refresh: "Refresh",
      export: "Export",
      search: "Search reviews...",
      allRatings: "All Ratings",
      allReviews: "All Reviews",
      verified: "Verified",
      unverified: "Unverified",
      clearFilters: "Clear Filters",
      noSelection: "No Selection",
      selectReviews: "Please select reviews to perform bulk action",
      reviewsVerified: "Reviews Verified",
      reviewsUnverified: "Reviews Unverified", 
      reviewsDeleted: "Reviews Deleted",
      reviewCreated: "Review Created",
      reviewUpdated: "Review Updated",
      reviewDeleted: "Review Deleted",
      creationFailed: "Creation Failed",
      updateFailed: "Update Failed",
      deleteFailed: "Delete Failed",
      bulkActionFailed: "Bulk Action Failed",
      noReviewsFound: "No reviews found matching your criteria",
      viewDetails: "View Details",
      editReview: "Edit Review",
      deleteReview: "Delete Review"
    },
    vi: {
      title: "Quản Lý Đánh Giá",
      subtitle: "Quản lý đánh giá và xếp hạng của khách hàng",
      totalReviews: "Tổng Đánh Giá",
      verifiedReviews: "Đánh Giá Đã Xác Minh",
      averageRating: "Đánh Giá Trung Bình", 
      recentReviews: "Đánh Giá Gần Đây",
      addReview: "Thêm Đánh Giá",
      refresh: "Làm Mới",
      export: "Xuất Dữ Liệu",
      search: "Tìm kiếm đánh giá...",
      allRatings: "Tất Cả Đánh Giá",
      allReviews: "Tất Cả",
      verified: "Đã Xác Minh",
      unverified: "Chưa Xác Minh",
      clearFilters: "Xóa Bộ Lọc",
      noSelection: "Chưa Chọn",
      selectReviews: "Vui lòng chọn đánh giá để thực hiện thao tác hàng loạt",
      reviewsVerified: "Đánh Giá Đã Xác Minh",
      reviewsUnverified: "Đánh Giá Chưa Xác Minh",
      reviewsDeleted: "Đánh Giá Đã Xóa", 
      reviewCreated: "Đánh Giá Đã Tạo",
      reviewUpdated: "Đánh Giá Đã Cập Nhật",
      reviewDeleted: "Đánh Giá Đã Xóa",
      creationFailed: "Tạo Thất Bại",
      updateFailed: "Cập Nhật Thất Bại",
      deleteFailed: "Xóa Thất Bại",
      bulkActionFailed: "Thao Tác Hàng Loạt Thất Bại",
      noReviewsFound: "Không tìm thấy đánh giá phù hợp với tiêu chí",
      viewDetails: "Xem Chi Tiết",
      editReview: "Sửa Đánh Giá",
      deleteReview: "Xóa Đánh Giá"
    },
    ja: {
      title: "レビュー管理",
      subtitle: "顧客のレビューと評価を管理",
      totalReviews: "総レビュー数",
      verifiedReviews: "認証済みレビュー",
      averageRating: "平均評価",
      recentReviews: "最近のレビュー", 
      addReview: "レビュー追加",
      refresh: "更新",
      export: "エクスポート",
      search: "レビューを検索...",
      allRatings: "すべての評価",
      allReviews: "すべて",
      verified: "認証済み",
      unverified: "未認証",
      clearFilters: "フィルターをクリア",
      noSelection: "選択なし",
      selectReviews: "バルクアクションを実行するにはレビューを選択してください",
      reviewsVerified: "レビューが認証されました",
      reviewsUnverified: "レビューが未認証になりました",
      reviewsDeleted: "レビューが削除されました",
      reviewCreated: "レビューが作成されました", 
      reviewUpdated: "レビューが更新されました",
      reviewDeleted: "レビューが削除されました",
      creationFailed: "作成に失敗しました",
      updateFailed: "更新に失敗しました",
      deleteFailed: "削除に失敗しました",
      bulkActionFailed: "バルクアクションに失敗しました",
      noReviewsFound: "条件に一致するレビューが見つかりません",
      viewDetails: "詳細を見る",
      editReview: "レビューを編集",
      deleteReview: "レビューを削除"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Load reviews
  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getReviews({ limit: 100 });
      setReviews(response.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        variant: "destructive",
        title: "Error Loading Reviews", 
        description: "Failed to load reviews data"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.getAdminUsers({ limit: 100 });
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const response = await api.getAdminProducts({ limit: 100 });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, []);

  useEffect(() => {
    loadReviews();
    loadUsers();
    loadProducts();
  }, [loadReviews, loadUsers, loadProducts]);

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.productId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    const matchesVerified = verifiedFilter === 'all' || 
      (verifiedFilter === 'verified' && review.verified) ||
      (verifiedFilter === 'unverified' && !review.verified);

    return matchesSearch && matchesRating && matchesVerified;
  });

  // Handle review actions
  const handleCreateReview = async () => {
    try {
      if (!formData.userId) {
        toast({
          variant: "warning",
          title: "Missing Information",
          description: "Please select a user"
        });
        return;
      }

      // productId is optional for admin-created reviews
      await api.createReview({
        userId: formData.userId,
        productId: formData.productId === 'no-product' ? undefined : formData.productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      });
      
      toast({
        variant: "success",
        title: t.reviewCreated,
        description: "New review has been created successfully"
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
      await loadReviews();
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        variant: "destructive",
        title: t.creationFailed,
        description: "Failed to create review"
      });
    }
  };

  const handleUpdateReview = async () => {
    if (!currentReview) return;
    
    try {
      if (!formData.userId) {
        toast({
          variant: "warning",
          title: "Missing Information",
          description: "Please select a user"
        });
        return;
      }

      if (!formData.productId || formData.productId === 'no-product') {
        toast({
          variant: "warning",
          title: "Missing Information",
          description: "Please select a product"
        });
        return;
      }

      await api.updateReview(currentReview._id, {
        userId: formData.userId,
        productId: formData.productId === 'no-product' ? undefined : formData.productId,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        verified: formData.verified
      });
      
      toast({
        variant: "success",
        title: t.reviewUpdated,
        description: "Review has been updated successfully"
      });
      
      setIsEditDialogOpen(false);
      setCurrentReview(null);
      resetForm();
      await loadReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        variant: "destructive",
        title: t.updateFailed,
        description: "Failed to update review"
      });
    }
  };

  const handleDeleteReview = async () => {
    if (!currentReview) return;
    
    try {
      await api.deleteReview(currentReview._id);
      
      toast({
        variant: "success",
        title: t.reviewDeleted,
        description: "Review has been deleted successfully"
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentReview(null);
      await loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        variant: "destructive",
        title: t.deleteFailed,
        description: "Failed to delete review"
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedReviews.length === 0) {
      toast({
        variant: "warning",
        title: t.noSelection,
        description: t.selectReviews
      });
      return;
    }

    try {
      switch (action) {
        case 'verify':
          await Promise.all(selectedReviews.map(id => 
            api.updateReview(id, { verified: true })
          ));
          toast({
            variant: "success",
            title: t.reviewsVerified,
            description: `${selectedReviews.length} reviews marked as verified`
          });
          break;
        case 'unverify':
          await Promise.all(selectedReviews.map(id => 
            api.updateReview(id, { verified: false })
          ));
          toast({
            variant: "info",
            title: t.reviewsUnverified,
            description: `${selectedReviews.length} reviews marked as unverified`
          });
          break;
        case 'delete':
          await Promise.all(selectedReviews.map(id => api.deleteReview(id)));
          toast({
            variant: "success",
            title: t.reviewsDeleted,
            description: `${selectedReviews.length} reviews deleted`
          });
          break;
      }
      
      setSelectedReviews([]);
      await loadReviews();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        variant: "destructive",
        title: t.bulkActionFailed,
        description: "Failed to perform bulk action"
      });
    }
  };

  const openEditDialog = (review: Review) => {
    setCurrentReview(review);
    setFormData({
      userId: review.userId?._id || '',
      productId: review.productId?._id || 'no-product',
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      verified: review.verified
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (review: Review) => {
    setCurrentReview(review);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (review: Review) => {
    setCurrentReview(review);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      productId: 'no-product',
      rating: 5,
      title: '',
      comment: '',
      verified: false
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const verifiedReviews = reviews.filter(r => r.verified).length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const recentReviews = reviews.filter(r => {
    const reviewDate = new Date(r.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return reviewDate > weekAgo;
  }).length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addReview}
            </Button>
            <Button variant="outline" size="sm" onClick={loadReviews}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalReviews}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReviews.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Active review system</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.verifiedReviews}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedReviews.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{totalReviews > 0 ? Math.round((verifiedReviews / totalReviews) * 100) : 0}% of total reviews</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.averageRating}</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Out of 5 stars</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.recentReviews}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentReviews.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Last 7 days</span>
              </div>
            </CardContent>
          </Card>
        </div>

              {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allRatings}</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allReviews}</SelectItem>
                  <SelectItem value="verified">{t.verified}</SelectItem>
                  <SelectItem value="unverified">{t.unverified}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setRatingFilter('all');
                setVerifiedFilter('all');
              }}>
                {t.clearFilters}
              </Button>
            </div>
          </CardContent>
        </Card>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedReviews.length} review(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('verify')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('unverify')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Unverify
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.noReviewsFound}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedReviews.length === filteredReviews.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedReviews(filteredReviews.map(r => r._id));
                          } else {
                            setSelectedReviews([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReviews.includes(review._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReviews([...selectedReviews, review._id]);
                            } else {
                              setSelectedReviews(selectedReviews.filter(id => id !== review._id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{review.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {review.comment}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{review.userId?.name || 'Anonymous'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{review.productId?.name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="text-sm ml-2">{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <Badge variant={review.verified ? "default" : "secondary"}>
                            {review.verified ? "Verified" : "Unverified"}
                          </Badge>
                          {review.helpful > 0 && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{review.helpful}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(review.createdAt)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openViewDialog(review)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(review)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(review)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">User</label>
              <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Product (Optional)</label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-product">No Product</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.nameEn || product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Rating</label>
              <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Review title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Review comment"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReview}>
                Create Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">User</label>
              <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Product</label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-product">No Product</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.nameEn || product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Rating</label>
              <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Review title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Review comment"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.verified}
                onCheckedChange={(checked) => setFormData({ ...formData, verified: !!checked })}
              />
              <label className="text-sm font-medium">Verified Review</label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReview}>
                Update Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {currentReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {renderStars(currentReview.rating)}
                  <span className="font-medium">{currentReview.rating}/5</span>
                </div>
                <Badge variant={currentReview.verified ? "default" : "secondary"}>
                  {currentReview.verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{currentReview.title}</h3>
                <p className="text-muted-foreground mt-2">{currentReview.comment}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User</label>
                  <p>{currentReview.userId?.name || 'Anonymous'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product</label>
                  <p>{currentReview.productId?.name || 'Unknown Product'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{formatDate(currentReview.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Helpful Votes</label>
                  <p>{currentReview.helpful}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
