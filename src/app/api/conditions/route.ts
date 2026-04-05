import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Auth Check
    const authHeader = req.headers.get('Authorization');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId = user?.id;

    // もし通常のアプリからのログインセッションが無い場合、専用APIキーを確認（iOSショートカット用）
    if (!userId) {
      if (authHeader === `Bearer ${process.env.SHORTCUT_API_KEY}`) {
        userId = data.user_id; // ショートカット側から送信される前提
      }
      
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { date, lightness, appetite, vertical_jump, sleep_score, resting_hr, weight } = data;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // upsertで同じ日のデータは上書き更新する
    const { error } = await supabase
      .from('conditions')
      .upsert({
        user_id: userId,
        date: targetDate,
        lightness,
        appetite,
        vertical_jump,
        sleep_score,
        resting_hr,
        weight
      }, { onConflict: 'user_id, date' });

    if (error) throw error;

    return NextResponse.json({ success: true, date: targetDate });

  } catch (error: any) {
    console.error('Conditions API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
