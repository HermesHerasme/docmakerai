
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the API client safely.
const apiKey = process.env.API_KEY; 
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateDocumentContent = async (
  prompt: string, 
  isHumanized: boolean, 
  plan: string,
  targetPages: number = 3,
  language: 'es' | 'en' = 'es',
  isGrayscale: boolean = false
): Promise<{ title: string; html: string; styles: string }> => {
  
  const wordsPerPage = 275; 
  const targetWordCount = targetPages * wordsPerPage;

  const modelName = 'gemini-3-flash-preview';

  const systemInstruction = `
You are an expert AI specialized in generating PROFESSIONAL, PRINT-READY HTML/CSS DOCUMENTS.
Your task is to create a document whose structure, style, and tone are determined by the user request.

🚫 NEVER use fixed widths (like 800px or 100%) in the CSS for the main wrapper. Use width: 100% and box-sizing: border-box.
🚫 DO NOT add a white background to your generated container; the application already provides the paper.

*** PAGE COUNT COMPLIANCE ***
- The user has requested EXACTLY ${targetPages} PAGES.
- Generate approximately ${targetWordCount} words. Be verbose and detailed.

*** STYLING ***
- ALL visual styles MUST be applied ONLY to the selector ".ai-generated-content" or its children.
- If grayscale is requested, use filter: grayscale(100%).

*** OUTPUT FORMAT ***
Return your response with a <style> block first, then the content div.
<style>
  .ai-generated-content {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #000;
    width: 100%;
    box-sizing: border-box;
    ${isGrayscale ? 'filter: grayscale(100%) !important;' : ''}
  }
  .ai-generated-content h1, .ai-generated-content h2 { margin-top: 1.5em; margin-bottom: 0.5em; }
  .ai-generated-content p { margin-bottom: 1em; }
</style>

<div class="ai-generated-content">
  [CONTENT FOR ${targetPages} PAGES]
</div>

*** RULES ***
1. NO explanations, NO markdown code blocks.
2. NO automatic disclaimers or copyright text unless explicitly asked.
3. HUMANIZATION: ${isHumanized ? 'ON' : 'OFF'}.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 8192,
        temperature: isHumanized ? 0.9 : 0.4, 
      },
    });

    let rawOutput = (response.text || '').trim();
    if (rawOutput.startsWith('```html')) {
        rawOutput = rawOutput.replace(/^```html/, '').replace(/```$/, '').trim();
    } else if (rawOutput.startsWith('```')) {
        rawOutput = rawOutput.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const titleMatch = rawOutput.match(/<h1>(.*?)<\/h1>/i) || rawOutput.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : "Generated Document";

    // Extract style and body separately
    const styleMatch = rawOutput.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const styles = styleMatch ? styleMatch[1].trim() : '';
    
    // Remove style tag from output to get the body
    let body = rawOutput.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim();

    return { title, html: body, styles };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate document.");
  }
};
