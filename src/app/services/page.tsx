import Link from "next/link";

export default function ServicesPage() {
  const services = [
    { title: "Catering", desc: "Traditional Tamil Nadu cuisine for your wedding." },
    { title: "Photography", desc: "Capture every precious moment." },
    { title: "Decoration", desc: "Beautiful venue and stage decoration." },
    { title: "Music & Entertainment", desc: "Live music and entertainment services." },
  ];
  return (
    <div style={{ padding: "48px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#731e36", fontFamily: "Georgia, serif" }}>Wedding Services</h1>
      <p style={{ marginTop: 8, color: "#6b7280" }}>Trusted vendors for every wedding need.</p>
      <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
        {services.map((s) => (
          <div key={s.title} style={{ background: "white", padding: 24, borderRadius: 12, border: "1px solid #fce4e8" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#731e36" }}>{s.title}</h3>
            <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 32, color: "#6b7280", fontSize: 14 }}>
        <Link href="/" style={{ color: "#a51d3c", fontWeight: 600 }}>Back to Home</Link>
      </p>
    </div>
  );
}
