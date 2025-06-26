import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import 'dotenv/config';
import fs from "fs";
import path from "path";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
// Use a multimodal model that supports image input
const model = "openai/gpt-4.1"; // Example multimodal model

export async function main() {
    // Read the image file and encode it as base64
    const imagePath = path.join(process.cwd(), "assets\contoso_layout_sketch.jpg")
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");

    const client = ModelClient(
        endpoint,
        new AzureKeyCredential(token),
    );

    // Prepare the message with image content
    const response = await client.path("/chat/completions").post({
        body: {
            messages: [
                { 
                    role: "system",
                    content: "You are an expert web developer. Generate clean, accessible, and well-commented HTML and CSS code based on user sketches or requirements. Ensure the code is easy to understand, follows best practices, and includes comments explaining key sections."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Write HTML and CSS code for a web page based on the following hand-drawn sketch with good colorful design and effects."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ],
            temperature: 1.0,
            top_p: 1.0,
            model: model,
        }
    });

    if (isUnexpected(response)) {
        throw response.body.error;
    }

    // Output the model's response to the console
    console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});

