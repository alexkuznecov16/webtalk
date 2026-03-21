'use client';

import '@/app/components/landing/styles/Landing.scss';
import Header from '../components/landing/header';
import Hero from '../components/landing/hero';
import About from '../components/landing/about';
import Footer from '../components/landing/footer';

import { useDatabase } from '@/context/DatabaseContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const router = useRouter();
  const { user, initialized } = useDatabase();

  useEffect(() => {
    if (initialized && user) {
      router.replace('/home');
    }
  }, [initialized, user, router]);

  if (!initialized) return null;

  return (
    <>
      <Header />
      <Hero />
      <About />
      <Footer />
    </>
  );
}
