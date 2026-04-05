import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeMealImage(imageBase64: string | null, mimeType: string | null, textPrompt: string | null) {
  // 環境で利用可能な最新モデル gemini-2.5-flash に変更
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", 
    systemInstruction: `あなたはプロのアスリート向け栄養管理AIです。
提供された食事の情報（テキストや画像）から、カロリーとPFC（タンパク質、脂質、炭水化物）を推測してください。
また、推測の精度を示す \`confidence_score\` (0-100) を算出してください。明確な内容やグラム数の指定があれば高く、アバウトな見た目や情報のみの場合は低めのスコア(50など)を設定します。
結果は必ず以下の形式のJSON文字列「のみ」を出力してください（マークダウンのバッククォート等は絶対に含まないこと）。
{ "kcal": 0, "protein": 0, "fat": 0, "carbs": 0, "confidence_score": 0, "description": "推測した食事内容の短い説明" }`
  });

  const prompt = textPrompt 
    ? `以下の補足テキストと画像（あれば）をもとに食事を解析し、JSON出力してください。\nテキスト補足: ${textPrompt}` 
    : "この食事を解析し、結果を指定のJSON形式で出力してください。";
  
  const parts: any[] = [{ text: prompt }];

  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    });
  }

  const result = await model.generateContent(parts);
  return result.response.text();
}
