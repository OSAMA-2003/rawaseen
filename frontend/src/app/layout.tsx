import type { Metadata, Viewport } from "next";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../i18n/LanguageContext";
import { Toaster } from "sonner";
import "../styles.css";

export const metadata: Metadata = {
  title: {
    default: "Rawasin — We shape places that endure | رواسن للتطوير العقاري",
    template: "%s | Rawasin — رواسن",
  },
  description:
    "Rawasin is a leading Egyptian real estate developer crafting architecture of permanence in New Sohag City and Sohag, Egypt. شركة رواسن للتطوير العقاري — نصيغ معالم تدوم في مدينة سوهاج الجديدة وسوهاج، مصر.",
  authors: [{ name: "Rawasin Real Estate" }],
  applicationName: "Rawasin",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-black.png",
  },
  openGraph: {
    title: "Rawasin — We shape places that endure | رواسن",
    description:
      "Rawasin is an Egyptian real estate developer crafting architecture of permanence in New Sohag City and Sohag. شركة رواسن للتطوير العقاري في مدينة سوهاج الجديدة وسوهاج، مصر.",
    siteName: "Rawasin",
    type: "website",
    locale: "ar_EG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rawasin — We shape places that endure | رواسن",
    description:
      "Rawasin is an Egyptian real estate developer crafting architecture of permanence in New Sohag City and Sohag, Egypt.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f6f2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-[#f8f6f2] text-[#182220] selection:bg-[#182220] selection:text-[#f8f6f2] antialiased">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster
              theme="light"
              position="top-right"
              richColors
              toastOptions={{
                style: {
                  borderRadius: "0px",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  backgroundColor: "#ffffff",
                  color: "#1c1917",
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

