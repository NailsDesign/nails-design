import Script from 'next/script';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Nails Design | Luxury Nail Salon',
  description: 'Experience premium manicures, pedicures, BIAB, and more in a modern and clean environment.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics (if needed) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C4LQ6E956J"
          strategy="afterInteractive"
        />
        <Script id="ga" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C4LQ6E956J');
          `}
        </Script>

        {/* ✅ Brevo tracker code */}
        <Script src="https://cdn.brevo.com/js/sdk-loader.js" strategy="afterInteractive" />
        <Script id="brevo-tracker" strategy="afterInteractive">
          {`
            window.Brevo = window.Brevo || [];
            Brevo.push([
              "init",
              {
                client_key: "6vb7rrr6u40vs2tje0hygkym"
              }
            ]);
          `}
        </Script>

        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ec4899" />
      </head>
      <body className="bg-white text-gray-800">
        <Header />
        <main>{children}</main>
        <Footer />

        {/* Mobile call-to-action button */}
        <a
          href="tel:02077920370"
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm md:hidden transition hover:bg-pink-700"
        >
          📞 Call Now
        </a>
      </body>
    </html>
  );
}
