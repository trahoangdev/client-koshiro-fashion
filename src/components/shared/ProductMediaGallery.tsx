import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  Play, 
  Pause 
} from 'lucide-react';

// Interface for media items (images and videos)
export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

interface ProductMediaGalleryProps {
  mediaItems: MediaItem[];
  productName: string;
  onSale?: boolean;
  salePrice?: number;
  originalPrice?: number;
  price?: number;
  language?: string;
}

const ProductMediaGallery: React.FC<ProductMediaGalleryProps> = ({
  mediaItems,
  productName,
  onSale,
  salePrice,
  originalPrice,
  price,
  language = 'en'
}) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState<{ [key: string]: boolean }>({});

  if (mediaItems.length === 0) {
    return (
      <div className="aspect-square bg-white rounded-2xl shadow-xl overflow-hidden border">
        <img
          src="/placeholder.svg"
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const currentMedia = mediaItems[selectedMediaIndex];

  return (
    <div className="flex space-x-4">
      {/* Vertical Thumbnail Gallery - Left Side */}
      {mediaItems.length > 1 && (
        <div className="flex flex-col space-y-3">
          {mediaItems.map((media, index) => (
            <button
              key={media.id}
              onClick={() => setSelectedMediaIndex(index)}
              className={`w-20 h-20 bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-primary/50 relative ${
                selectedMediaIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt={media.alt || `${productName} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={media.thumbnail || media.url}
                    alt={media.alt || `${productName} video ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-3 h-3 text-black ml-0.5" />
                    </div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Media Display - Right Side */}
      <div className="flex-1">
        <div className="aspect-square bg-white rounded-2xl shadow-xl overflow-hidden border relative group">
          {currentMedia?.type === 'video' ? (
            <div className="relative w-full h-full">
              <video
                key={currentMedia.id}
                src={currentMedia.url}
                poster={currentMedia.thumbnail}
                className="w-full h-full object-cover"
                controls
                onPlay={() => setVideoPlaying({ [currentMedia.id]: true })}
                onPause={() => setVideoPlaying({ [currentMedia.id]: false })}
              />
              {!videoPlaying[currentMedia.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-16 w-16 rounded-full shadow-lg"
                    onClick={() => {
                      const video = document.querySelector(`video[src="${currentMedia.url}"]`) as HTMLVideoElement;
                      if (video) video.play();
                    }}
                  >
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Dialog open={isImageZoomed} onOpenChange={setIsImageZoomed}>
              <DialogTrigger asChild>
                <img
                  src={currentMedia?.url || '/placeholder.svg'}
                  alt={currentMedia?.alt || productName}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                />
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <img
                  src={currentMedia?.url || '/placeholder.svg'}
                  alt={currentMedia?.alt || productName}
                  className="w-full h-full object-contain"
                />
              </DialogContent>
            </Dialog>
          )}
          
          {/* Zoom Icon for Images */}
          {currentMedia?.type === 'image' && (
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-lg">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation Arrows */}
          {mediaItems.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMediaIndex(selectedMediaIndex > 0 ? selectedMediaIndex - 1 : mediaItems.length - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setSelectedMediaIndex(selectedMediaIndex < mediaItems.length - 1 ? selectedMediaIndex + 1 : 0)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Sale Badge */}
          {onSale && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="destructive" className="px-3 py-1 text-sm font-bold">
                {salePrice && salePrice < (price || 0) ? (
                  <>
                    -{Math.round(((price! - salePrice) / price!) * 100)}%
                    <span className="ml-1">
                      {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'SALE'}
                    </span>
                  </>
                ) : originalPrice && originalPrice > (price || 0) ? (
                  <>
                    -{Math.round(((originalPrice - price!) / originalPrice) * 100)}%
                    <span className="ml-1">
                      {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'SALE'}
                    </span>
                  </>
                ) : (
                  <span>
                    {language === 'vi' ? 'KHUYẾN MÃI' : language === 'ja' ? 'セール' : 'SALE'}
                  </span>
                )}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductMediaGallery;
