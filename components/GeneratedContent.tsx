
import React from 'react';

interface LandingPageProps {
  onTryForFree: () => void;
}

const galleryPatterns = [
  { id: 1, src: "https://images.unsplash.com/photo-1548371520-235dd527c69e?q=80&w=800&auto=format&fit=crop", prompt: "Vintage floral chintz" },
  { id: 2, src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop", prompt: "Abstract fluid waves" },
  { id: 3, src: "https://images.unsplash.com/photo-1542648693-c23c780d9324?q=80&w=800&auto=format&fit=crop", prompt: "Art deco geometric" },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onTryForFree }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center my-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-neo-pink rounded-full blur-[100px] opacity-20 -z-10"></div>
        <h1 className="text-6xl md:text-8xl font-display font-black text-neo-black mb-6 leading-none tracking-tighter">
          DESIGN<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-neo-purple via-neo-pink to-neo-yellow">FUTURE</span><br/>TODAY.
        </h1>
        <p className="mt-6 text-xl font-medium text-neo-black max-w-2xl mx-auto bg-white border-2 border-neo-black p-4 shadow-neo inline-block transform -rotate-1">
          Generative AI for the bold. Create patterns, visualize outfits, domination.
        </p>
        <div className="mt-12">
            <button 
            onClick={onTryForFree}
            className="bg-neo-yellow text-neo-black font-black py-4 px-10 text-xl border-3 border-neo-black shadow-neo-lg hover:shadow-none hover:translate-y-2 transition-all uppercase tracking-widest"
            >
            Start Designing Now
            </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="my-24">
        <h3 className="text-4xl font-display font-black text-center mb-12 uppercase border-b-4 border-neo-black inline-block mx-auto px-8 pb-2">The Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 border-3 border-neo-black shadow-neo hover:-translate-y-2 transition-transform">
            <div className="text-5xl font-black mb-4 text-neo-purple">01</div>
            <h4 className="text-2xl font-bold mb-2 font-display uppercase">Generate</h4>
            <p className="text-neo-black font-medium">Describe a pattern. AI weaves it instantly.</p>
          </div>
          <div className="bg-neo-bg p-8 border-3 border-neo-black shadow-neo hover:-translate-y-2 transition-transform">
            <div className="text-5xl font-black mb-4 text-neo-blue">02</div>
            <h4 className="text-2xl font-bold mb-2 font-display uppercase">Visualize</h4>
            <p className="text-neo-black font-medium">Drape fabrics on virtual models. Any size, any pose.</p>
          </div>
          <div className="bg-white p-8 border-3 border-neo-black shadow-neo hover:-translate-y-2 transition-transform">
            <div className="text-5xl font-black mb-4 text-neo-pink">03</div>
            <h4 className="text-2xl font-bold mb-2 font-display uppercase">Export</h4>
            <p className="text-neo-black font-medium">Get Tech Packs and high-res assets instantly.</p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="my-24">
        <h3 className="text-4xl font-display font-black text-center mb-12 uppercase">Made with FashionAI</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryPatterns.map(p => (
            <div key={p.id} className="relative group border-3 border-neo-black shadow-neo">
              <img className="w-full h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-300" src={p.src} alt={p.prompt} />
              <div className="bg-white border-t-3 border-neo-black p-3">
                <p className="text-neo-black font-bold uppercase text-xs tracking-wider">{p.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="my-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-white p-10 border-3 border-neo-black shadow-neo">
                <h4 className="text-3xl font-display font-black mb-2 uppercase">Starter</h4>
                <p className="text-neo-black font-bold mb-6 bg-neo-bg inline-block px-2">For the curious.</p>
                <p className="text-6xl font-black mb-6">$0</p>
                <ul className="space-y-3 text-neo-black mb-8 font-medium">
                    <li className="flex items-center gap-2"><span>✓</span> 10 free generations</li>
                    <li className="flex items-center gap-2"><span>✓</span> Standard-res previews</li>
                </ul>
                <button onClick={onTryForFree} className="w-full bg-neo-bg border-3 border-neo-black text-neo-black font-bold py-4 px-4 hover:bg-gray-100 transition-colors uppercase shadow-neo-sm hover:shadow-none hover:translate-y-1">Start Free</button>
            </div>
             <div className="bg-neo-yellow p-12 border-3 border-neo-black shadow-neo-lg transform md:scale-105 relative">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-neo-black text-white text-sm font-black px-6 py-2 uppercase tracking-widest border-2 border-white shadow-neo-sm rotate-2">Best Value</div>
                <h4 className="text-4xl font-display font-black mb-2 uppercase">Pro Studio</h4>
                <p className="text-neo-black font-bold mb-6">For the serious designer.</p>
                <p className="text-7xl font-black mb-2">$19<span className="text-xl font-bold opacity-50">/mo</span></p>
                <ul className="space-y-3 text-neo-black mb-10 font-bold text-lg">
                    <li className="flex items-center gap-2"><span>✓</span> Unlimited generations</li>
                    <li className="flex items-center gap-2"><span>✓</span> 4K exports & Tech Packs</li>
                    <li className="flex items-center gap-2"><span>✓</span> Commercial license</li>
                </ul>
                <button onClick={onTryForFree} className="w-full bg-neo-black text-white border-3 border-transparent hover:bg-white hover:text-neo-black hover:border-neo-black font-black py-5 px-4 shadow-neo hover:shadow-none hover:translate-y-1 transition-all uppercase text-xl">Get Pro Access</button>
            </div>
        </div>
      </div>
    </div>
  );
};
    