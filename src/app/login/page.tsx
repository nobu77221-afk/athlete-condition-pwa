"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (result.error) alert(result.error.message);
      else alert("アカウントを作成しました！");
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) alert(result.error.message);
      else {
        // デフォルトのターゲット値を最初のログイン時に作成（モック）
        await supabase.from('daily_targets').upsert({
            user_id: result.data.user?.id,
            date: new Date().toISOString().split('T')[0],
            target_kcal: 3000,
            target_protein: 160,
            target_fat: 70,
            target_carbs: 350
        }, { onConflict: 'user_id, date' })
        
        router.push("/");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center p-6 space-y-8 bg-zinc-950">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Athlete</h1>
        <p className="text-zinc-500 font-medium tracking-widest text-sm">CONDITION PWA</p>
      </div>

      <form className="w-full max-w-sm space-y-4 bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="••••••••"
          />
        </div>
        
        <div className="pt-4 flex flex-col space-y-3">
          <button
            onClick={(e) => handleLogin(e, false)}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            {loading ? "Processing..." : "Login"}
          </button>
          
          <button
            onClick={(e) => handleLogin(e, true)}
            disabled={loading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition-all active:scale-95 text-sm"
          >
            新規登録 (初回のみ)
          </button>
        </div>
      </form>
    </div>
  );
}
