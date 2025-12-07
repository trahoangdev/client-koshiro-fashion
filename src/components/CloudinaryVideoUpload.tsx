import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { Upload, X, Play, Loader2, Video, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CloudinaryVideo {
  publicId: string;
  secureUrl: string;
  duration?: number;
  format: string;
  bytes: number;
}

interface CloudinaryVideoUploadProps {
  onVideosUploaded: (videos: CloudinaryVideo[]) => void;
  onVideosRemoved: (videoIds: string[]) => void;
  existingVideos?: CloudinaryVideo[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

const CloudinaryVideoUpload = memo(function CloudinaryVideoUpload({
  onVideosUploaded,
  onVideosRemoved,
  existingVideos = [],
  maxFiles = 5,
  maxSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv']
}: CloudinaryVideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState<CloudinaryVideo[]>(existingVideos);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  // Sync uploadedVideos with existingVideos when it changes
  const existingVideosKey = useMemo(() => 
    `${existingVideos.length}-${existingVideos.map(video => video.publicId).join(',')}`, 
    [existingVideos]
  );
  
  useEffect(() => {
    setUploadedVideos(existingVideos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingVideosKey]);

  // Memoize validation functions to prevent re-renders
  const validateFile = useCallback((file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported video format`,
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [acceptedTypes, maxSize, toast]);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (existingVideos.length + fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} videos allowed`,
        variant: "destructive"
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('videos', file);
      });

      const response = await fetch('/api/upload/videos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const uploadedVideos: CloudinaryVideo[] = result.data.map((video: CloudinaryVideo) => ({
          publicId: video.publicId,
          secureUrl: video.secureUrl,
          duration: video.duration || 0,
          format: video.format,
          bytes: video.bytes
        }));

        // Validate uploaded videos
        const validVideos = uploadedVideos.filter(video => 
          video.publicId && video.secureUrl && video.secureUrl.includes('cloudinary.com')
        );

        if (validVideos.length !== uploadedVideos.length) {
          console.warn('Some videos have invalid URLs, filtering them out');
        }

        if (validVideos.length > 0) {
          setUploadedVideos(prevVideos => [...prevVideos, ...validVideos]);
          
          // Call callback after state update
          setTimeout(() => {
            onVideosUploaded(validVideos);
          }, 0);
          
          toast({
            title: "Videos uploaded successfully",
            description: `${validVideos.length} video(s) uploaded`,
          });
        } else {
          throw new Error('No valid videos were uploaded');
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload videos',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [existingVideos.length, maxFiles, validateFile, onVideosUploaded, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  const handleRemoveVideo = useCallback((videoId: string) => {
    setUploadedVideos(prevVideos => prevVideos.filter(video => video.publicId !== videoId));
    
    // Call callback after state update
    setTimeout(() => {
      onVideosRemoved([videoId]);
    }, 0);
  }, [onVideosRemoved]);

  // Memoize utility functions
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    if (seconds === 0) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoize computed values to prevent unnecessary re-renders
  const remainingFiles = useMemo(() => maxFiles - uploadedVideos.length, [maxFiles, uploadedVideos.length]);
  const isDisabled = useMemo(() => uploading || uploadedVideos.length >= maxFiles, [uploading, uploadedVideos.length, maxFiles]);
  const maxSizeMB = useMemo(() => Math.round(maxSize / (1024 * 1024)), [maxSize]);
  const acceptedTypesString = useMemo(() => 
    acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', '), 
    [acceptedTypes]
  );

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : isDisabled
            ? 'border-gray-300 opacity-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isDisabled}
        />
        
        <div className="space-y-2">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              {uploading ? 'Uploading videos...' : 'Drop videos here or click to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: {acceptedTypesString}
            </p>
            <p className="text-xs text-gray-500">
              Max size: {maxSizeMB}MB per file
            </p>
          </div>
          
          {uploading && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Existing Videos */}
      {uploadedVideos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Videos ({uploadedVideos.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedVideos.map((video, index) => (
              <Card key={video.publicId} className="relative group">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <video
                        src={video.secureUrl}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          Video {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVideo(video.publicId)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span className="uppercase">{video.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{formatFileSize(video.bytes)}</span>
                        </div>
                        {video.duration && video.duration > 0 && (
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
          disabled={uploading || uploadedVideos.length >= maxFiles}
          className="w-full max-w-xs"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Videos'}
        </Button>
      </div>
    </div>
  );
});

export default CloudinaryVideoUpload;
