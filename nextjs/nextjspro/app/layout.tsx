import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import AOSInit from "@/components/AOSInit";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ARX Infotech | IT Services & Tech Solutions",
    template: "%s | ARX Infotech",
  },
  description:
    "ARX Infotech is a leading IT services company in Kolkata providing web development, mobile apps, cloud services, IT consulting, and digital marketing.",
  keywords: [
    "IT services Kolkata",
    "web development India",
    "mobile app development",
    "cloud services",
    "IT consulting",
    "digital marketing",
    "ARX Infotech",
  ],
  authors: [{ name: "ARX Infotech" }],
  creator: "ARX Infotech",
  metadataBase: new URL("https://arxinfo.tech"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://arxinfo.tech",
    siteName: "ARX Infotech",
    title: "ARX Infotech | IT Services & Tech Solutions",
    description:
      "Leading IT services company in Kolkata — web development, mobile apps, cloud, consulting & digital marketing.",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "ARX Infotech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ARX Infotech | IT Services & Tech Solutions",
    description:
      "Leading IT services company in Kolkata — web development, mobile apps, cloud, consulting & digital marketing.",
    images: ["/images/og-banner.png"],
  },
  icons: {
    icon: [
      { url: "/images/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
    shortcut: "/images/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "ARX Infotech",
  url: "https://arxinfo.tech",
  logo: "https://arxinfo.tech/images/logo.png",
  image: "https://arxinfo.tech/images/og-banner.png",
  telephone: "+91-8317818107",
  email: "info@arxinfo.tech",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1st Floor, 150, Panchita, Bongaon-Bagdh Rd",
    addressLocality: "Kolkata",
    addressRegion: "West Bengal",
    postalCode: "743235",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 23.1087,
    longitude: 88.8111,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "10:00",
    closes: "19:00",
  },
  sameAs: [
    "https://wa.me/918317818107",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${poppins.variable} ${inter.variable} font-inter`} suppressHydrationWarning>
        <Providers>
          <AOSInit />
          <Preloader />
          <Navbar />
          <main>{children}</main>
          <ConditionalFooter><Footer /></ConditionalFooter>
          <WhatsAppButton />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
