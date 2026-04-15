
import { Link } from "react-router-dom";
import GlassCard from "../../components/Ui/GlassCard";
import SectionTitle from "../../components/Ui/SectionTitle";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 pb-28 lg:pb-10 text-white p-5">

      {/* Back */}
      <Link to="/" className="inline-block mb-4 px-4 py-2 rounded-full bg-white/10 border border-white/20">
        ← Back
      </Link>

      {/* Hero */}
      <GlassCard className="mb-6 text-center">
        <div className="text-4xl mb-2">🎁</div>
        <h1 className="text-2xl font-bold">About DaanPeti</h1>
        <p className="opacity-80">India's free item donation platform</p>
      </GlassCard>

      {/* Story */}
      <GlassCard className="mb-6">
        <SectionTitle>Hamari Kahani 📖</SectionTitle>
        <p className="opacity-90">
          DaanPeti was born from a simple idea — every Indian home has things it no longer needs...
        </p>
      </GlassCard>

      {/* Mission */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          ["🎯", "Zero Waste"],
          ["💚", "Community First"],
          ["🆓", "Always Free"]
        ].map(([icon, title]) => (
          <GlassCard key={title}>
            <div className="text-2xl">{icon}</div>
            <h3 className="font-semibold mt-2">{title}</h3>
          </GlassCard>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["1,000+", "500+", "10+", "100%"].map((stat) => (
          <GlassCard key={stat} className="text-center">
            <div className="text-xl font-bold">{stat}</div>
          </GlassCard>
        ))}
      </div>

      {/* Belief */}
      <GlassCard className="mb-6">
        <SectionTitle>Hamara Vishwas 🙏</SectionTitle>
        <p>
          In India, giving has always been a way of life...
        </p>
      </GlassCard>

      {/* Team */}
      <GlassCard className="mb-6">
        <SectionTitle>Banaya Kisne? 👨‍💻</SectionTitle>
        <p>Small passionate team building for community.</p>
      </GlassCard>

      {/* CTA */}
      <Link
        to="/post-item"
        className="block text-center py-3 rounded-xl bg-green-600 hover:opacity-90"
      >
        Start Donating Today →
      </Link>
    </div>
  );
}