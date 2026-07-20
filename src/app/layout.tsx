export const metadata = {
  title: "WedBridge - Tamil Nadu Matrimony",
  description: "AI-powered matrimony platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#fdf2f4", color: "#1a1a1a" }}>
        {children}
      </body>
    </html>
  );
}
