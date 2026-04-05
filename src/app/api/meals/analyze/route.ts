import { NextResponse } from 'next/server';
import { analyzeMealImage } from '@/utils/gemini';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. ログインが必要です。' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const textPrompt = formData.get('text') as string | null;
    
    if (!file && !textPrompt) {
      return NextResponse.json({ error: '画像またはテキストのどちらかを入力してください' }, { status: 400 });
    }

    let base64 = null;
    let mimeType = null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      base64 = buffer.toString('base64');
      mimeType = file.type;
    }
    
    // Geminiに解析をリクエスト
    const analysisJsonString = await analyzeMealImage(base64, mimeType, textPrompt);
    
    // JSONのパース処理
    let analysis;
    try {
      const cleanedString = analysisJsonString.replace(/```json/g, '').replace(/```/g, '').trim();
      analysis = JSON.parse(cleanedString);
      
      // AIが少数点以下（例: 2.9）を返した場合、データベースのINTEGER型でエラーになるのを防ぐため四捨五入する
      analysis.kcal = Math.round(Number(analysis.kcal)) || 0;
      analysis.protein = Math.round(Number(analysis.protein)) || 0;
      analysis.fat = Math.round(Number(analysis.fat)) || 0;
      analysis.carbs = Math.round(Number(analysis.carbs)) || 0;
      analysis.confidence_score = Math.round(Number(analysis.confidence_score)) || 0;
      
    } catch (e) {
      return NextResponse.json({ error: 'AI出力のパースに失敗しました。詳細にもう少し記載してください。', raw: analysisJsonString }, { status: 500 });
    }

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Meal analysis error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
