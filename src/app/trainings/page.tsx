import BottomNav from "@/components/layout/BottomNav";

export default function Trainings() {
  return (
    <div className="flex flex-col min-h-[100dvh] pb-24 px-5 pt-12 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">Workout</h1>
      <p className="text-zinc-500 font-medium">Dominate the gym or the court.</p>
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-36 flex flex-col items-center justify-center text-zinc-300 font-semibold active:bg-zinc-800 transition-colors shadow-lg">
           Weights
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-36 flex flex-col items-center justify-center text-zinc-300 font-semibold active:bg-zinc-800 transition-colors shadow-lg">
           Court Practice
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
