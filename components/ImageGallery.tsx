'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { IMAGES_CONFIG, getImagePaths, shouldShowCarousel } from '@/lib/images-config';

interface ImageGalleryProps {
  section: keyof typeof IMAGES_CONFIG;
  className?: string;
  imageClassName?: string;
  showIndicators?: boolean;
  autoRotateInterval?: number;
}

export function ImageGallery({
  section,
  className = '',
  imageClassName = 'object-contain',
  showIndicators = true,
  autoRotateInterval = 5000,
}: ImageGalleryProps) {
  const config = IMAGES_CONFIG[section];
  const imagePaths = getImagePaths(section);
  const isCarousel = shouldShowCarousel(section);

  const [currentImage, setCurrentImage] = useState(0);

  // Auto-rotate pour carousel
  useEffect(() => {
    if (!isCarousel || imagePaths.length === 0) return;

    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % imagePaths.length);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [isCarousel, imagePaths.length, autoRotateInterval]);

  // Si pas d'images configurées
  if (config.count === 0 || imagePaths.length === 0) {
    return null;
  }

  // Affichage d'une seule image
  if (!isCarousel) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={imagePaths[0]}
          alt={config.alt}
          fill
          className={imageClassName}
          sizes="100vw"
          priority
        />
      </div>
    );
  }

  // Affichage carousel
  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image
            src={imagePaths[currentImage]}
            alt={config.alt}
            fill
            className={imageClassName}
            priority={currentImage === 0}
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Carousel Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {imagePaths.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentImage
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
