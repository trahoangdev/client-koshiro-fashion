import React, { useState, useCallback, useEffect, memo, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  responsiveUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
}

interface CloudinaryImageUploadProps {
  onImagesUploaded: (images: CloudinaryImage[]) => void;
  onImagesRemoved: (publicIds: string[]) => void;
  existingImages?: CloudinaryImage[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

export const CloudinaryImageUpload: React.FC<CloudinaryImageUploadProps> = memo(({
  onImagesUploaded,
  onImagesRemoved,
  existingImages = [],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<CloudinaryImage[]>(existingImages);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Debounced progress update to reduce flickering
  const [debouncedProgress, setDebouncedProgress] = useState(0);
  
  // Use ref to prevent unnecessary re-renders
  const isUploadingRef = useRef(false);
  const isDeletingRef = useRef<string | null>(null);
  const uploadCallbackRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize accepted types object to prevent re-renders
  const acceptedTypesObject = useMemo(() => {
    return acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>);
  }, [acceptedTypes]);

  // Sync uploadedImages with existingImages when it changes
  const existingImagesKey = useMemo(() => 
    `${existingImages.length}-${existingImages.map(img => img.publicId).join(',')}`, 
    [existingImages]
  );
  
  useEffect(() => {
    setUploadedImages(existingImages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingImagesKey]);

  // Cleanup progress interval and upload callback on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (uploadCallbackRef.current) {
        clearTimeout(uploadCallbackRef.current);
      }
    };
  }, []);

  // Debounce progress updates to reduce flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProgress(uploadProgress);
    }, 50); // 50ms debounce

    return () => clearTimeout(timer);
  }, [uploadProgress]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Clear any existing progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    setUploading(true);
    isUploadingRef.current = true;
    setError(null);
    setUploadProgress(0);

    try {
      // Validate files before upload
      const validFiles = acceptedFiles.filter(file => {
        if (file.size > maxSize) {
          toast({
            title: "File quá lớn",
            description: `File ${file.name} vượt quá giới hạn ${formatFileSize(maxSize)}`,
            variant: "destructive",
          });
          return false;
        }
        if (!acceptedTypes.includes(file.type)) {
          toast({
            title: "Định dạng không hỗ trợ",
            description: `File ${file.name} có định dạng không được hỗ trợ`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Simulate progress with smoother animation
      progressIntervalRef.current = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return 90;
          }
          return prev + 3; // Even slower increment to reduce flickering
        });
      }, 150); // Increased interval to reduce frequency

      const response = await fetch('/api/products/upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.data && Array.isArray(result.data)) {
        // Validate uploaded data
        const validUploadedImages = result.data.filter((img: CloudinaryImage) => 
          img.publicId && img.secureUrl && img.responsiveUrls
        );

        if (validUploadedImages.length > 0) {
          // Use functional update to prevent stale closure
          setUploadedImages(prevImages => [...prevImages, ...validUploadedImages]);
          
          // Call callback after state update with debounce
          if (uploadCallbackRef.current) {
            clearTimeout(uploadCallbackRef.current);
          }
          uploadCallbackRef.current = setTimeout(() => {
            onImagesUploaded(validUploadedImages);
            uploadCallbackRef.current = null;
          }, 100); // Increased debounce time
          
          toast({
            title: "Upload thành công",
            description: `Đã upload ${validUploadedImages.length} hình ảnh`,
          });
        } else {
          throw new Error('No valid images were uploaded');
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      toast({
        title: "Upload thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      isUploadingRef.current = false;
      setUploadProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  }, [onImagesUploaded, toast, maxSize, acceptedTypes, formatFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypesObject,
    maxSize,
    maxFiles: maxFiles - uploadedImages.length,
    disabled: uploading || uploadedImages.length >= maxFiles
  });

  const removeImage = useCallback(async (publicId: string) => {
    if (isDeletingRef.current === publicId) return; // Prevent multiple delete requests

    setIsDeleting(publicId);
    isDeletingRef.current = publicId;
    
    try {
      const response = await fetch('/api/products/delete-images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ publicIds: [publicId] })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Delete failed' }));
        throw new Error(errorData.message || 'Delete failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Use functional update to prevent stale closure
        setUploadedImages(prevImages => prevImages.filter(img => img.publicId !== publicId));
        
        // Call callback after state update with debounce
        setTimeout(() => {
          onImagesRemoved([publicId]);
        }, 100); // Increased debounce time
        
        toast({
          title: "Xóa thành công",
          description: "Hình ảnh đã được xóa",
        });
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      toast({
        title: "Xóa thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      isDeletingRef.current = null;
    }
  }, [onImagesRemoved, toast]);

  // Memoize computed values to prevent unnecessary re-renders
  const remainingFiles = useMemo(() => maxFiles - uploadedImages.length, [maxFiles, uploadedImages.length]);
  const isDisabled = useMemo(() => uploading || uploadedImages.length >= maxFiles, [uploading, uploadedImages.length, maxFiles]);
  const acceptedTypesString = useMemo(() => acceptedTypes.join(', '), [acceptedTypes]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              {uploading ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2 w-full max-w-xs">
                    <p className="text-sm text-muted-foreground">Đang upload...</p>
                    <Progress value={debouncedProgress} className="w-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragActive ? 'Thả file vào đây' : 'Kéo thả hoặc click để chọn hình ảnh'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {acceptedTypesString} • Tối đa {formatFileSize(maxSize)} • {remainingFiles} file còn lại
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Hình ảnh đã upload ({uploadedImages.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <Card key={image.publicId} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-md">
                    <img
                      src={image.responsiveUrls.thumbnail || image.secureUrl}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to secureUrl if thumbnail fails
                        const target = e.target as HTMLImageElement;
                        if (target.src !== image.secureUrl) {
                          target.src = image.secureUrl;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.publicId)}
                        disabled={isDeleting === image.publicId}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isDeleting === image.publicId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {isDeleting === image.publicId && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.width} × {image.height}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(image.bytes)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {image.format?.toUpperCase() || 'Unknown'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Đang upload hình ảnh... Vui lòng không đóng trang này.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
});

export default CloudinaryImageUpload;
