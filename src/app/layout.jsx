import "./globals.css";

export const metadata = {
  title: "WedBridge - Tamil Nadu Matrimony",
  description: "AI-powered matrimony platform connecting Tamil Nadu families.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#fdf2f4", color: "#1a1a1a", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
