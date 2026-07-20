import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#fdf2f4", color: "#1a1a1a", margin: 0 }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
