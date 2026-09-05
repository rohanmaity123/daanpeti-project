import '../../scss/shopsection.scss';

const SHOP_NAME = "ভোল্টা দার দকান";

const FEATURES = [
    {
        icon: "🎵",
        title: "টানা বাংলা গান",
        text: "সারাদিন ধরে বাজতে থাকা বাছাই করা বাংলা গানের প্লেলিস্ট, দোকানের পরিবেশে মিশে যাওয়ার মতো করে সাজানো।",
    },
    {
        icon: "🖱️",
        title: "একটাই ক্লিক",
        text: "কোনো সাইন আপ বা অ্যাপ ডাউনলোডের দরকার নেই। প্লে বোতামে চাপ দিলেই গান শুরু, বন্ধ করতে চাইলে আবার চাপ দিলেই থেমে যাবে।",
    },
    {
        icon: "🕒",
        title: "সবসময় খোলা",
        text: "এই রেডিও কখনো বন্ধ হয় না। যেকোনো সময়, যেকোনো দিন, ব্রাউজার খুললেই গান শোনা যাবে, একদম বিনামূল্যে।",
    },
];

const FAQS = [
    {
        q: "এই গানের প্লেয়ারটা আসলে কী?",
        a: `${SHOP_NAME}-এর নিজস্ব একটা মিউজিক প্লেয়ার, যেখানে বাছাই করা বাংলা গান একের পর এক বাজতে থাকে — দোকানে বসে থাকা সময়টা একটু সুরেলা করে তোলার জন্য।`,
    },
    {
        q: "গান শুনতে কি টাকা লাগবে?",
        a: "না, এটা সম্পূর্ণ বিনামূল্যে। কোনো সাবস্ক্রিপশন বা সাইন আপ ছাড়াই যে কেউ ব্রাউজার থেকে সরাসরি গান শুনতে পারবেন।",
    },
    {
        q: "গানগুলো কোথা থেকে আসে?",
        a: "গানগুলো YouTube-এর মাধ্যমে স্ট্রিম হয়। এই ওয়েবসাইটে কোনো গান সরাসরি হোস্ট করা নেই, স্বত্ব সবসময় মূল শিল্পী ও প্রকাশকদের কাছেই থাকে।",
    },
    {
        q: "পরবর্তী বা আগের গানে যাওয়া যাবে?",
        a: "হ্যাঁ, প্লেয়ারের পাশে থাকা পরবর্তী ও আগের বোতাম দিয়ে সহজেই প্লেলিস্টের যেকোনো গানে যাওয়া যাবে।",
    },
    {
        q: "মোবাইল থেকে শোনা যাবে কি?",
        a: "একদম। এই প্লেয়ারটি মোবাইল ও ডেস্কটপ দুই জায়গাতেই একইভাবে কাজ করে, আলাদা কোনো অ্যাপের দরকার নেই।",
    },
];

function FaqItem({ q, a, defaultOpen }) {
    return (
        <details className="ss-faq-item" open={defaultOpen}>
            <summary className="ss-faq-question">
                {q}
                <svg className="ss-faq-chevron" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </summary>
            <p className="ss-faq-answer">{a}</p>
        </details>
    );
}

export function AboutSection() {
    return (
        <section id="about" className="ss-about">
            <div className="ss-about-inner">
                <p className="ss-eyebrow">পরিচিতি</p>
                <h2 className="ss-heading">
                    {SHOP_NAME} — গানে গানে ছোট্ট একটা আড্ডার জায়গা
                </h2>
                <p className="ss-lead">
                    {SHOP_NAME} মূলত একটা ছোট্ট, ঘরোয়া দোকানের পরিবেশ তুলে ধরার চেষ্টা —
                    যেখানে কাজের ফাঁকে ফাঁকে রেডিওতে বাংলা গান বাজতেই থাকে। এই পাতাটা
                    সেই একই অনুভূতি অনলাইনে নিয়ে আসার একটা ছোট্ট প্রয়াস, যাতে যে কেউ,
                    যেকোনো সময়, একটা বোতাম টিপেই সেই সুরের মধ্যে ঢুকে যেতে পারেন।
                </p>

                <div className="ss-feature-grid">
                    {FEATURES.map((f) => (
                        <div className="ss-feature-card" key={f.title}>
                            <span className="ss-feature-icon" aria-hidden="true">
                                {f.icon}
                            </span>
                            <h3 className="ss-feature-title">{f.title}</h3>
                            <p className="ss-feature-text">{f.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function FaqSection() {
    return (
        <section id="faq" className="ss-faq">
            <div className="ss-faq-inner">
                <p className="ss-eyebrow ss-eyebrow-center">সচরাচর জিজ্ঞাসা</p>
                <h2 className="ss-heading ss-heading-center">
                    {SHOP_NAME} সম্পর্কে যা জানা দরকার
                </h2>

                <div className="ss-faq-list">
                    {FAQS.map((item, i) => (
                        <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export function ShopFooter() {
    return (
        <footer className="ss-footer">
            <p className="ss-footer-shopname">{SHOP_NAME}</p>
            <p className="ss-footer-tagline">বাংলা গানের ছোট্ট আড্ডা</p>

            <p className="ss-footer-disclaimer">
                দ্রষ্টব্য: এই ওয়েবসাইটে গান YouTube-এর এমবেডেড প্লেয়ারের মাধ্যমে
                বাজানো হয়। এখানে কোনো গান সরাসরি হোস্ট করা নেই, এবং সমস্ত স্বত্ব
                সংশ্লিষ্ট শিল্পী, প্রযোজক ও প্রকাশকদের কাছেই সংরক্ষিত।
            </p>

            <p className="ss-footer-credit">
                Powered By{" "}
                <span className="ss-footer-credit-name">Maity's Tech Lab</span>
            </p>
        </footer>
    );
}