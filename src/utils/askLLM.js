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