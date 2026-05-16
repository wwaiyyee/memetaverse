import Navbar from '@/components/Navbar';

export default function History() {
  return (
    <div className="min-h-screen bg-[#0d0b14] text-white">
      <Navbar />
      <main className="px-8 py-12 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">history</h1>
        <p className="text-white/40 text-sm mb-8">
          on-chain contribution log · all transactions verifiable on Monad
        </p>

        {/* TODO: fetch on-chain contribution events and render timeline */}
        <div className="rounded-xl border border-white/8 bg-white/2 px-6 py-8 text-center">
          <p className="text-white/25 text-sm">transaction history coming soon</p>
        </div>
      </main>
    </div>
  );
}
