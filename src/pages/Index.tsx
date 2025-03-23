
import React, { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Hero from '@/components/sections/Hero';

const Index = () => {
  // Optional: preload any assets
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
    </main>
  );
};

export default Index;
