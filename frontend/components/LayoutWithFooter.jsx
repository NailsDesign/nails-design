"use client";
import Header from './Header';
import Footer from './Footer';
import { usePathname } from 'next/navigation';

export default function LayoutWithFooter({ children }) {
  const pathname = usePathname();
  // List of routes where the footer should be hidden
  const hideFooterRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/admin/login',
    '/admin',
    '/admin/dashboard',
    '/booking',
    '/dashboard',
  ];
  // Hide footer if pathname matches any of the above or is a subroute
  const shouldHideFooter = hideFooterRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
  return (
    <>
      <Header />
      <main>{children}</main>
      {!shouldHideFooter && <Footer />}
    </>
  );
} 