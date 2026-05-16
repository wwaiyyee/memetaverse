import Navbar from '@/components/Navbar';
import ConnectWallet from '@/components/ConnectWallet';

export default function Contribute() {
  return (
    <div className="min-h-screen bg-[#0d0b14] text-white">
      <Navbar />
      <main className="px-8 py-12 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">contribute</h1>
        <p className="text-white/40 text-sm mb-8">
          add a meme to the archive · contributions recorded on-chain via Monad
        </p>

        {/* TODO: submission form — name, origin country, year, image upload, description */}
        <div className="rounded-xl border border-white/8 bg-white/2 px-6 py-8 text-center">
          <p className="text-white/30 text-sm mb-4">connect your wallet to submit</p>
          <ConnectWallet />
        </div>
      </main>
    </div>
  );
}
