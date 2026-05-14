export const askLLM = async (prompt) => {
    const models = [
        "llama-3.1-8b-instant"
    ];

    for (let model of models) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.3,
                    // stream: true,
                }),
            });

            const data = await res.json();

            // ✅ if model works → return
            if (!data.error) {
                return data.choices?.[0]?.message?.content || "";
            }

        } catch (err) {
            console.warn(`Model ${model} failed, trying next...`);
        }
    }

    return "Server busy hai, thoda baad try karo.";
};
export const getDoctorCategoryFromSymptoms = async (symptoms) => {
    const models = [
        "llama-3.1-8b-instant"
    ];

    const prompt = `
You are a medical assistant.

Based on these symptoms:
"${symptoms}"

Suggest the MOST RELEVANT doctor specialization.

Rules:
- Return ONLY the doctor category name
- No explanation
- One category only

Examples:
- Chest pain and shortness of breath → Cardiologist
- Tooth pain → Dentist
- Skin rash and itching → Dermatologist
- Pregnancy issues → Gynecologist
- Joint pain → Orthopedic
- Fever and cough → General Physician
`;

    for (let model of models) {
        try {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    temperature: 0.2,
                }),
            });

            const data = await res.json();

            if (!data.error) {
                return data.choices?.[0]?.message?.content?.trim() || "General Physician";
            }

        } catch (err) {
            console.warn(`Model ${model} failed, trying next...`);
        }
    }

    return "General Physician";
};
export const askLLMStream = async (prompt, onChunk) => {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant", // or fallback list
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            stream: true, // 🔥 IMPORTANT
        }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let done = false;
    let fullText = ""; // Collect all chunks if no callback provided

    while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split("\n").filter(line => line.trim() !== "");

        for (let line of lines) {
            if (line === "data: [DONE]") break;

            if (line.startsWith("data: ")) {
                try {
                    const json = JSON.parse(line.replace("data: ", ""));
                    const token = json.choices?.[0]?.delta?.content;

                    if (token) {
                        fullText += token;
                        // If callback provided, send token to UI; otherwise collect it
                        if (typeof onChunk === "function") {
                            onChunk(token);
                        }
                    }
                } catch (err) {
                    console.warn("Failed to parse chunk:", err);
                }
            }
        }
    }

    // Return collected text if no callback was provided
    return fullText;
};