'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface ScrollProgressBarProps {
  height?: number;
  position?: 'top' | 'bottom';
  zIndex?: number;
  showPercentage?: boolean;
  gradient?: boolean;
}

export default function ScrollProgressBar({
  height = 4,
  position = 'top',
  zIndex = 100,
  showPercentage = false,
  gradient = true,
}: ScrollProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const scrollToPosition = useCallback((positionX: number) => {
    if (!containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
    const scrollPercentage = (positionX / containerWidth) * 100;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollableDistance = documentHeight - windowHeight;
    
    const targetScrollY = (scrollPercentage / 100) * scrollableDistance;
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }, []);
  
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const positionX = e.clientX - rect.left;
    scrollToPosition(positionX);
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const positionX = e.clientX - rect.left;
    scrollToPosition(positionX);
  }, [isDragging, scrollToPosition]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  useEffect(() => {
    const calculateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      if (documentHeight === windowHeight) {
        setScrollProgress(100);
        return;
      }

      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(scrollPercentage, 100));
    };

    calculateScrollProgress();
    window.addEventListener('scroll', calculateScrollProgress);
    
    return () => {
      window.removeEventListener('scroll', calculateScrollProgress);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="scroll-progress-container cursor-pointer" 
      style={{ 
        top: position === 'top' ? 0 : 'auto',
        bottom: position === 'bottom' ? 0 : 'auto',
        height: `${height}px`,
        zIndex,
      }}
      onClick={handleContainerClick}
      onMouseDown={handleMouseDown}
      title="Click or drag to navigate"
    >
      <div 
        className="scroll-progress-bar" 
        style={{ 
          width: `${scrollProgress}%`
        }}
      >
        <div className="scroll-handle" style={{
          right: scrollProgress > 98 ? '10px' : '2px'
        }}></div>
      </div>
      
      {showPercentage && (
        <div 
          className="scroll-progress-percentage"
          style={{
            top: position === 'top' ? '10px' : 'auto',
            bottom: position === 'bottom' ? '10px' : 'auto',
          }}
        >
          {Math.round(scrollProgress)}%
        </div>
      )}
    </div>
  );
} 