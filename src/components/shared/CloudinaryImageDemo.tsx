import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloudinaryImage, CloudinaryImageGallery, LazyCloudinaryImage } from './CloudinaryImage';

/**
 * Demo component for CloudinaryImage components
 * This component demonstrates the usage of CloudinaryImage, CloudinaryImageGallery, and LazyCloudinaryImage
 */
export const CloudinaryImageDemo: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<'thumbnail' | 'medium' | 'large' | 'original'>('medium');
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock Cloudinary image data
  const mockImages = [
    {
      publicId: 'koshiro-fashion/products/demo-1',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/koshiro-fashion/products/demo-1.jpg',
      responsiveUrls: {
        thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-1.jpg',
        medium: 'https://res.cloudinary.com/demo/image/upload/w_600,h_600,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-1.jpg',
        large: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_1200,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-1.jpg',
        original: 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-1.jpg'
      }
    },
    {
      publicId: 'koshiro-fashion/products/demo-2',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/koshiro-fashion/products/demo-2.jpg',
      responsiveUrls: {
        thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-2.jpg',
        medium: 'https://res.cloudinary.com/demo/image/upload/w_600,h_600,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-2.jpg',
        large: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_1200,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-2.jpg',
        original: 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-2.jpg'
      }
    },
    {
      publicId: 'koshiro-fashion/products/demo-3',
      secureUrl: 'https://res.cloudinary.com/demo/image/upload/v1234567890/koshiro-fashion/products/demo-3.jpg',
      responsiveUrls: {
        thumbnail: 'https://res.cloudinary.com/demo/image/upload/w_300,h_300,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-3.jpg',
        medium: 'https://res.cloudinary.com/demo/image/upload/w_600,h_600,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-3.jpg',
        large: 'https://res.cloudinary.com/demo/image/upload/w_1200,h_1200,c_fill,q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-3.jpg',
        original: 'https://res.cloudinary.com/demo/image/upload/q_auto,f_auto/v1234567890/koshiro-fashion/products/demo-3.jpg'
      }
    }
  ];

  const sizes: Array<{ value: typeof selectedSize; label: string; description: string }> = [
    { value: 'thumbnail', label: 'Thumbnail', description: '300x300px' },
    { value: 'medium', label: 'Medium', description: '600x600px' },
    { value: 'large', label: 'Large', description: '1200x1200px' },
    { value: 'original', label: 'Original', description: 'Full resolution' }
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Cloudinary Image Components Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of CloudinaryImage, CloudinaryImageGallery, and LazyCloudinaryImage components
        </p>
      </div>

      {/* Size Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Image Size Selector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Button
                key={size.value}
                variant={selectedSize === size.value ? 'default' : 'outline'}
                onClick={() => setSelectedSize(size.value)}
                className="flex flex-col items-center p-4 h-auto"
              >
                <span className="font-medium">{size.label}</span>
                <span className="text-xs text-muted-foreground">{size.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Single Image Display */}
      <Card>
        <CardHeader>
          <CardTitle>Single CloudinaryImage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">Size: {selectedSize}</Badge>
              <Badge variant="outline">Public ID: {mockImages[selectedImage].publicId}</Badge>
            </div>
            <div className="flex justify-center">
              <div className="w-96 h-96 border rounded-lg overflow-hidden">
                <CloudinaryImage
                  {...mockImages[selectedImage]}
                  alt="Demo product image"
                  size={selectedSize}
                  className="w-full h-full"
                  onClick={() => console.log('Image clicked!')}
                  onLoad={() => console.log('Image loaded!')}
                  onError={(e) => console.log('Image error:', e)}
                />
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {mockImages.map((_, index) => (
                <Button
                  key={index}
                  variant={selectedImage === index ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedImage(index)}
                >
                  Image {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>CloudinaryImageGallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click on any image to see the click handler in action
            </p>
            <CloudinaryImageGallery
              images={mockImages}
              alt="Product gallery"
              columns={3}
              gap="md"
              onImageClick={(index, image) => {
                console.log('Gallery image clicked:', { index, image });
                setSelectedImage(index);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lazy Loading Demo */}
      <Card>
        <CardHeader>
          <CardTitle>LazyCloudinaryImage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scroll down to see lazy loading in action. Images will load when they come into view.
            </p>
            <div className="space-y-8">
              {/* Spacer to demonstrate lazy loading */}
              <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Scroll down to see lazy loaded images</p>
              </div>
              
              {mockImages.map((image, index) => (
                <div key={image.publicId} className="space-y-2">
                  <h4 className="font-medium">Lazy Image {index + 1}</h4>
                  <div className="w-full h-64 border rounded-lg overflow-hidden">
                    <LazyCloudinaryImage
                      {...image}
                      alt={`Lazy loaded image ${index + 1}`}
                      size="medium"
                      className="w-full h-full"
                      threshold={0.1}
                      onLoad={() => console.log(`Lazy image ${index + 1} loaded!`)}
                      onError={(e) => console.log(`Lazy image ${index + 1} error:`, e)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Info */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Responsive Images</h4>
              <p className="text-sm text-muted-foreground">
                Automatic srcSet generation for optimal loading on different screen sizes
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Lazy Loading</h4>
              <p className="text-sm text-muted-foreground">
                Images load only when they come into view, improving page performance
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Error Handling</h4>
              <p className="text-sm text-muted-foreground">
                Automatic fallback to original URL if responsive URLs fail
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Optimized Performance</h4>
              <p className="text-sm text-muted-foreground">
                Uses useMemo and useCallback for optimal re-rendering
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Type Safety</h4>
              <p className="text-sm text-muted-foreground">
                Full TypeScript support with comprehensive interfaces
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Accessibility</h4>
              <p className="text-sm text-muted-foreground">
                Proper alt text support and keyboard navigation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudinaryImageDemo;
