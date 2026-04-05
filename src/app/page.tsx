import BottomNav from "@/components/layout/BottomNav";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().split('T')[0];

  // 目標値の取得
  const { data: targetData } = await supabase
    .from('daily_targets')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  // デフォルトのターゲット
  const target = { 
    kcal: targetData?.target_kcal || 3000, 
    protein: targetData?.target_protein || 160, 
    fat: targetData?.target_fat || 70, 
    carbs: targetData?.target_carbs || 350 
  };

  // 本日の食事データの合計を取得
  const { data: meals } = await supabase
    .from('meals')
    .select('kcal, protein, fat, carbs')
    .eq('user_id', user.id)
    .eq('date', today);

  const current = (meals || []).reduce((acc, meal) => ({
    kcal: acc.kcal + meal.kcal,
    protein: acc.protein + meal.protein,
    fat: acc.fat + meal.fat,
    carbs: acc.carbs + meal.carbs,
  }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });

  const calcPercent = (curr: number, max: number) => Math.min(Math.round((curr / max) * 100), 100);

  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 px-5 pt-12 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-zinc-400 bg-clip-text text-transparent">Hello, Athlete</h1>
          <p className="text-zinc-500 font-medium mt-1">Ready to dominate today?</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
          <span className="text-xl font-bold text-zinc-400">#</span>
        </div>
      </div>

      {/* Hero Card: Today's Intake */}
      <section className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[64px] rounded-full"></div>
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-zinc-400 text-sm font-semibold tracking-wider uppercase mb-1">Calories Consumed</h2>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-white">{current.kcal}</span>
              <span className="text-zinc-500 font-medium">/ {target.kcal} kcal</span>
            </div>
          </div>
        </div>

        <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${calcPercent(current.kcal, target.kcal)}%` }}
          />
        </div>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <MacroCard label="Protein" current={current.protein} target={target.protein} colorClass="bg-blue-500" unit="g" />
          <MacroCard label="Fat" current={current.fat} target={target.fat} colorClass="bg-amber-500" unit="g" />
          <MacroCard label="Carbs" current={current.carbs} target={target.carbs} colorClass="bg-purple-500" unit="g" />
        </div>
      </section>

      {/* AI Feedback Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-100 flex items-center">
          <svg className="w-5 h-5 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Status Update
        </h3>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 rounded-l-2xl"></div>
          <p className="text-zinc-300 leading-relaxed text-sm">
            現在の摂取タンパク質は目標の36%です。筋肉の合成を最大化するため、次の食事で少なくとも40gのタンパク質を追加摂取してください。疲労の抜け（軽さ: 3）と起床時心拍から判断し、本日のトレーニングは中程度の負荷が推奨されます。
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4 pb-12">
        <h3 className="text-lg font-bold text-zinc-100">Quick Log</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/meals" className="flex flex-col items-center justify-center bg-zinc-900 hover:bg-zinc-800 transition-colors active:scale-95 border border-zinc-800 rounded-3xl p-6 h-36 gap-3 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-semibold text-zinc-200">Snap Meal</span>
          </Link>
          
          <Link href="/trainings" className="flex flex-col items-center justify-center bg-zinc-900 hover:bg-zinc-800 transition-colors active:scale-95 border border-zinc-800 rounded-3xl p-6 h-36 gap-3 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="font-semibold text-zinc-200">Log Workout</span>
          </Link>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}

function MacroCard({ label, current, target, colorClass, unit }: { label: string, current: number, target: number, colorClass: string, unit: string }) {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-zinc-400">
        <span>{label}</span>
      </div>
      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-zinc-200">{current}</span>
        <span className="text-[10px] text-zinc-500 font-medium"> / {target}{unit}</span>
      </div>
    </div>
  );
}
