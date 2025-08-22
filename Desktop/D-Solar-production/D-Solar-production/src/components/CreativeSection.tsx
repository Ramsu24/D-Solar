import { useState, useEffect, ReactNode } from 'react';
import classes from '../styles/CreativeSection.module.css';
import { motion } from 'framer-motion'; // For content animations

interface CreativeSectionProps {
  children: ReactNode;
}

const CreativeSection: React.FC<CreativeSectionProps> = ({ children }) => {
  const [color, setColor] = useState('rgb(255, 255, 0)'); // Initial color: yellow

  // Handle scroll to update blob colors
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercent = Math.min(
        Math.max((scrollY / (documentHeight - windowHeight)) * 100, 0),
        100
      );

      let newColor;
      if (scrollPercent < 50) {
        const factor = scrollPercent / 50;
        newColor = interpolateColor([255, 255, 0], [255, 255, 255], factor); // Yellow to White
      } else {
        const factor = (scrollPercent - 50) / 50;
        newColor = interpolateColor([255, 255, 255], [0, 0, 255], factor); // White to Blue
      }
      setColor(newColor);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate 5 animated blobs with random properties
  const blobs = Array.from({ length: 5 }, (_, i) => {
    const size = Math.random() * 200 + 150; // 150-350px for large particles
    const left = `${Math.random() * 100}%`;
    const top = `${Math.random() * 100}%`;
    const duration = Math.random() * 10 + 5; // 5-15s animation duration
    return (
      <div
        key={i}
        className={classes.blob}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left,
          top,
          animationDuration: `${duration}s`,
          backgroundColor: color,
        }}
      />
    );
  });

  return (
    <section className={classes.section}>
      <div className={classes.background}>{blobs}</div>
      <motion.div
        className={classes.content}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        {children}
      </motion.div>
    </section>
  );
};

// Color interpolation function
const interpolateColor = (color1: number[], color2: number[], factor: number) => {
  const r = Math.round(color1[0] + factor * (color2[0] - color1[0]));
  const g = Math.round(color1[1] + factor * (color2[1] - color1[1]));
  const b = Math.round(color1[2] + factor * (color2[2] - color1[2]));
  return `rgb(${r}, ${g}, ${b})`;
};

export default CreativeSection;