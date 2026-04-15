
import { Link } from "react-router-dom";
import GlassCard from "../../components/Ui/GlassCard";
import SectionTitle from "../../components/Ui/SectionTitle";

export default function Privacy() {
    const sections = [
        "Information We Collect",
        "How We Use Your Information",
        "What We Don't Do",
        "Data Storage",
        "Cookies",
        "Your Rights",
        "Children's Privacy",
        "Changes",
        "Contact"
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 pb-28 text-white p-5">
            <Link to="/" className="mb-4 inline-block">← Back</Link>

            <GlassCard>
                <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-sm opacity-70 mb-4">April 15, 2025</p>

                {sections.map((s, i) => (
                    <div key={i} className="mb-4">
                        <SectionTitle>{i + 1}. {s}</SectionTitle>
                        <p className="opacity-90">Content for {s}</p>
                    </div>
                ))}
            </GlassCard>
        </div>
    );
}