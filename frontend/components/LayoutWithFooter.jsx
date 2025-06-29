"use client";
import Header from './Header';
import Footer from './Footer';
import { usePathname } from 'next/navigation';

export default function LayoutWithFooter({ children }) {
  const pathname = usePathname();
  return (
    <>
      <Header />
      <main>{children}</main>
      {!pathname.startsWith('/booking') && <Footer />}
    </>
  );
} 