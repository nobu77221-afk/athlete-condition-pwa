"use client";
import { useState, useRef } from "react";
import BottomNav from "@/components/layout/BottomNav";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Meals() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAnalysis(null);
    }
  };

  const analyze = async () => {
    if (!file && !textInput) {
      alert("写真かテキストを入力してください！");
      return;
    }
    setAnalyzing(true);
    try {
      const formData = new FormData();
      if (file) formData.append("image", file);
      if (textInput) formData.append("text", textInput);
      
      const res = await fetch("/api/meals/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setAnalysis(data);
    } catch (err: any) {
      alert("解析エラー: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインしていません");

      let publicUrl = null;

      // 画像がある場合のみストレージへ保存
      if (file) {
        const ext = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${ext}`;
        
        const { error: uploadError } = await supabase.storage.from('meal_images').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('meal_images').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }

      // DBへ保存
      const { error: dbError } = await supabase.from('meals').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        image_url: publicUrl, // 画像なしの場合はnull
        description: `【入力】${textInput}\n${analysis.description}`.trim(),
        kcal: analysis.kcal,
        protein: analysis.protein,
        fat: analysis.fat,
        carbs: analysis.carbs,
        confidence_score: analysis.confidence_score
      });

      if (dbError) throw dbError;
      
      alert("保存しました！");
      router.push("/");
    } catch (err: any) {
      alert("エラー: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] pb-32 px-5 pt-12 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Log Meal</h1>
      <p className="text-zinc-500 font-medium leading-snug">写真かテキストを入力し、AIにカロリーを割り出させましょう。</p>
      
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCapture} />

      {!preview ? (
        <button onClick={() => fileInputRef.current?.click()} className="bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-3xl h-48 flex flex-col items-center justify-center p-4 hover:bg-zinc-800 active:bg-zinc-800 transition-colors w-full shadow-lg">
          <div className="w-16 h-16 rounded-full bg-zinc-950 flex items-center justify-center text-emerald-500 mb-3 shadow-lg shadow-emerald-900/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
          <span className="text-zinc-300 font-semibold text-lg">Tap to Open Camera</span>
        </button>
      ) : (
        <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-zinc-800 shadow-xl group">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button onClick={() => { setPreview(null); setFile(null); setAnalysis(null); }} className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md text-white p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Text Input Block */}
      <div className="space-y-2">
        <label className="text-sm font-semibold tracking-wide text-zinc-400">文字で補足（または画像なしで入力）</label>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="例: ご飯大盛り、唐揚げ3つ"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none h-24 shadow-lg"
        ></textarea>
      </div>

      {(!analysis && !analyzing) && (
        <button onClick={analyze} disabled={!file && !textInput} className="w-full py-4 rounded-2xl font-bold disabled:opacity-50 text-zinc-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all shadow-emerald-900/30 shadow-lg">
          AIで解析する
        </button>
      )}

      <div className="w-full">
         {analyzing ? (
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 shadow-xl">
             <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-zinc-400 font-medium animate-pulse">AI is carefully analyzing...</p>
           </div>
         ) : analysis ? (
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
             <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
               <h3 className="font-bold text-lg text-white">Analysis Result</h3>
               {analysis.confidence_score < 70 && (
                 <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/50 text-amber-500 text-[11px] font-bold rounded-lg flex items-center">
                   <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                   推測が含まれます
                 </span>
               )}
             </div>
             <p className="text-sm text-zinc-400 leading-relaxed">{analysis.description}</p>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center text-center space-y-1">
                   <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest w-full">Kcal</span>
                   <span className="text-3xl font-extrabold text-white">{analysis.kcal}</span>
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-medium space-y-2">
                   <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold">P</span> <span className="text-blue-400 font-bold text-base">{analysis.protein}g</span></div>
                   <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold">F</span> <span className="text-amber-400 font-bold text-base">{analysis.fat}g</span></div>
                   <div className="flex justify-between items-center text-sm"><span className="text-zinc-500 font-bold">C</span> <span className="text-purple-400 font-bold text-base">{analysis.carbs}g</span></div>
                </div>
             </div>

             <div className="pt-2">
               <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-xl font-bold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all shadow-emerald-900/30 shadow-lg">
                 {saving ? "保存中..." : "結果をご自身の記録に保存する"}
               </button>
             </div>
           </div>
         ) : null}
      </div>

      <BottomNav />
    </div>
  )
}
