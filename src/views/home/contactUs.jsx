import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 👉 Replace this with Supabase / backend call
        console.log(form);

        setSuccess(true);
        setForm({ name: "", email: "", message: "" });
    };

    return (
        <div className="p-5 max-w-2xl mx-auto px-4 pb-28 text-white">
            <Link to="/" className="mb-4 inline-block">← Back</Link>
            <div className="  p-3 flex justify-center items-center">
                <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 text-white shadow-xl">

                    {/* Left Side */}
                    <div>
                        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
                        <p className="opacity-80 mb-4">Have questions? We'd love to hear from you.</p>

                        <div className="space-y-2 text-sm">
                            <p>Email: support@yourapp.com</p>
                            <p>Location: India</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
                        />

                        <textarea
                            name="message"
                            placeholder="Your Message"
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                        >
                            Send Message
                        </button>

                        {success && (
                            <p className="text-green-400 text-sm mt-2">
                                ✅ Message sent successfully!
                            </p>
                        )}
                    </form>

                </div>
            </div>
        </div>
    );
}