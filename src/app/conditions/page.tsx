import BottomNav from "@/components/layout/BottomNav";

export default function Conditions() {
  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 px-5 pt-12 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">Condition</h1>
      <p className="text-zinc-500 font-medium">How are you feeling today?</p>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-8 shadow-xl">
         <div className="space-y-4">
           <label className="text-zinc-400 text-sm font-semibold uppercase tracking-wider block text-center">Body Lightness</label>
           <div className="flex justify-between items-center px-2">
             {[1,2,3,4,5].map(v => (
               <button key={v} className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold active:bg-purple-500 active:text-white transition-colors shadow-inner flex items-center justify-center">
                 {v}
               </button>
             ))}
           </div>
         </div>

         <div className="space-y-4">
           <label className="text-zinc-400 text-sm font-semibold uppercase tracking-wider block text-center">Appetite</label>
           <div className="flex justify-between items-center px-2">
             {[1,2,3,4,5].map(v => (
               <button key={v} className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-bold active:bg-purple-500 active:text-white transition-colors shadow-inner flex items-center justify-center">
                 {v}
               </button>
             ))}
           </div>
         </div>
      </div>
      <BottomNav />
    </div>
  )
}
