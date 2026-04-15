import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Constants
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';

/**
 * Props for the CloudinaryImage component
 */
interface CloudinaryImageProps {
  /** Cloudinary public ID of the image */
  publicId: string;
  /** Secure URL of the original image */
  secureUrl: string;
  /** Responsive URLs for different image sizes */
  responsiveUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
  /** Alt text for accessibility */
  alt: string;
  /** Additional CSS classes */
  className?: string;
  /** Image size to display */
  size?: 'thumbnail' | 'medium' | 'large' | 'original';
  /** Image width (for custom transformations) */
  width?: number;
  /** Image height (for custom transformations) */
  height?: number;
  /** Crop mode for transformations */
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  /** Quality setting for optimization */
  quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
  /** Format for the image */
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'gif';
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  /** Click handler */
  onClick?: () => void;
  /** Load event handler */
  onLoad?: () => void;
  /** Error event handler */
  onError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * CloudinaryImage Component
 * 
 * A responsive image component that displays Cloudinary images with automatic optimization,
 * responsive sizing, and fallback handling.
 * 
 * @param props - CloudinaryImageProps
 * @returns JSX.Element
 * 
 * @example
 * ```tsx
 * <CloudinaryImage
 *   publicId="koshiro-fashion/products/abc123"
 *   secureUrl="https://res.cloudinary.com/your-cloud/image/upload/v1234567890/koshiro-fashion/products/abc123.jpg"
 *   responsiveUrls={{
 *     thumbnail: "https://res.cloudinary.com/your-cloud/image/upload/w_300,h_300,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/abc123.jpg",
 *     medium: "https://res.cloudinary.com/your-cloud/image/upload/w_600,h_600,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/abc123.jpg",
 *     large: "https://res.cloudinary.com/your-cloud/image/upload/w_1200,h_1200,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/abc123.jpg",
 *     original: "https://res.cloudinary.com/your-cloud/image/upload/q_auto,f_auto/v1234567890/koshiro-fashion/products/abc123.jpg"
 *   }}
 *   alt="Product image"
 *   size="medium"
 *   className="w-full h-full object-cover"
 * />
 * ```
 */
export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  publicId,
  secureUrl,
  responsiveUrls,
  alt,
  className,
  size = 'medium',
  width,
  height,
  crop = 'fill',
  quality = 'auto',
  format = 'auto',
  loading = 'lazy',
  onClick,
  onLoad,
  onError
}) => {
  // Generate responsive image URL based on size
  const imageUrl = useMemo(() => {
    switch (size) {
      case 'thumbnail':
        return responsiveUrls.thumbnail;
      case 'medium':
        return responsiveUrls.medium;
      case 'large':
        return responsiveUrls.large;
      case 'original':
        return responsiveUrls.original;
      default:
        return responsiveUrls.medium;
    }
  }, [size, responsiveUrls]);

  // Generate srcSet for responsive images
  const srcSet = useMemo(() => {
    return `${responsiveUrls.thumbnail} 300w, ${responsiveUrls.medium} 600w, ${responsiveUrls.large} 1200w`;
  }, [responsiveUrls]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Fallback to original URL if responsive URLs fail
    const target = e.target as HTMLImageElement;
    if (target.src !== secureUrl) {
      target.src = secureUrl;
    }
    
    // Call custom error handler if provided
    onError?.(e);
  }, [secureUrl, onError]);

  return (
    <img
      src={imageUrl}
      srcSet={srcSet}
      sizes="(max-width: 300px) 300px, (max-width: 600px) 600px, 1200px"
      alt={alt}
      className={cn(
        'object-cover transition-opacity duration-200',
        onClick && 'cursor-pointer hover:opacity-90',
        className
      )}
      loading={loading}
      onClick={onClick}
      onLoad={onLoad}
      onError={handleError}
    />
  );
};

/**
 * Cloudinary Image Gallery Component
 * Displays multiple Cloudinary images in a responsive grid
 */
/**
 * Cloudinary image data structure
 */
interface CloudinaryImageData {
  /** Cloudinary public ID */
  publicId: string;
  /** Secure URL of the original image */
  secureUrl: string;
  /** Responsive URLs for different sizes */
  responsiveUrls: {
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  };
}

interface CloudinaryImageGalleryProps {
  images: CloudinaryImageData[];
  alt?: string;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  onImageClick?: (index: number, image: CloudinaryImageData) => void;
}

export const CloudinaryImageGallery: React.FC<CloudinaryImageGalleryProps> = ({
  images,
  alt = 'Product images',
  className,
  columns = 3,
  gap = 'md',
  onImageClick
}) => {
  const gridCols = useMemo(() => ({
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }), []);

  const gapClasses = useMemo(() => ({
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }), []);

  const handleImageClick = useCallback((index: number, image: CloudinaryImageData) => {
    onImageClick?.(index, image);
  }, [onImageClick]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid',
      gridCols[columns],
      gapClasses[gap],
      className
    )}>
      {images.map((image, index) => (
        <div key={image.publicId} className="relative group">
          <CloudinaryImage
            {...image}
            alt={`${alt} ${index + 1}`}
            size="medium"
            className="w-full h-full aspect-square rounded-lg"
            onClick={() => handleImageClick(index, image)}
          />
          {onImageClick && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-full p-2">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Cloudinary Image with Lazy Loading
 * Optimized for performance with intersection observer
 */
interface LazyCloudinaryImageProps extends CloudinaryImageProps {
  placeholder?: string;
  threshold?: number;
}

export const LazyCloudinaryImage: React.FC<LazyCloudinaryImageProps> = ({
  placeholder = DEFAULT_PLACEHOLDER,
  threshold = 0.1,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    props.onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    props.onError?.(e);
  };

  return (
    <div ref={imgRef} className={cn('relative', props.className)}>
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {isInView && !hasError && (
        <CloudinaryImage
          {...props}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            props.className,
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center text-muted-foreground">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryImage;
