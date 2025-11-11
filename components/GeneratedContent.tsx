import React from 'react';

interface LandingPageProps {
  onTryForFree: () => void;
}

const galleryPatterns = [
  { id: 1, src: "https://images.unsplash.com/photo-1553641213-205a8f6e6edd?q=80&w=800&auto=format&fit=crop", prompt: "Vintage floral chintz, muted color palette" },
  { id: 2, src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop", prompt: "Abstract fluid waves, pastel gradients" },
  { id: 3, src: "https://images.unsplash.com/photo-1629196929339-a68b7530b3a3?q=80&w=800&auto=format&fit=crop", prompt: "Art deco geometric shapes with gold and navy blue" },
  { id: 4, src: "https://images.unsplash.com/photo-1596799379201-923985f42a04?q=80&w=800&auto=format&fit=crop", prompt: "Hand-drawn tropical leaves and hibiscus flowers" },
  { id: 5, src: "https://images.unsplash.com/photo-1549492423-400259a5e5a5?q=80&w=800&auto=format&fit=crop", prompt: "Minimalist Scandinavian folk art, black and white" },
  { id: 6, src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop", prompt: "Soft watercolor galaxy with subtle constellations" },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onTryForFree }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center my-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          The Future of Fashion Design is Here.
        </h1>
        <h2 className="mt-4 text-2xl md:text-4xl font-extrabold text-white">
          Create & Visualize Breathtaking Designs with AI.
        </h2>
        <p className="mt-6 text-lg text-slate-400 max-w-3xl mx-auto">
          Describe your vision. Our AI brings it to life in seconds. Go from prompt to a virtual model showcase instantly.
        </p>
        <button 
          onClick={onTryForFree}
          className="mt-8 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          Try FashionAI for Free
        </button>
      </div>

      {/* How It Works */}
      <div className="my-24">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl mb-4 text-indigo-400">1.</div>
            <h4 className="text-xl font-semibold mb-2">Create or Upload</h4>
            <p className="text-slate-400">Describe a pattern with text, or upload an existing design for the AI to analyze.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl mb-4 text-indigo-400">2.</div>
            <h4 className="text-xl font-semibold mb-2">Visualize Your Outfit</h4>
            <p className="text-slate-400">Apply your fabrics to a virtual model, select an outfit style, and choose a body type.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-3xl mb-4 text-indigo-400">3.</div>
            <h4 className="text-xl font-semibold mb-2">Export Your Vision</h4>
            <p className="text-slate-400">Download high-resolution images of your patterns and model visualizations to share or produce.</p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="my-24">
        <h3 className="text-3xl font-bold text-center mb-12">Inspiration Gallery</h3>
        <div className="columns-2 md:columns-3 gap-4">
          {galleryPatterns.map(p => (
            <div key={p.id} className="mb-4 break-inside-avoid-column relative group overflow-hidden rounded-lg">
              <img className="w-full h-auto rounded-lg" src={p.src} alt={p.prompt} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm">{p.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="my-24 max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 text-center">
                <h4 className="text-2xl font-bold mb-2">Free</h4>
                <p className="text-slate-400 mb-6">Perfect for trying out the platform.</p>
                <p className="text-4xl font-bold mb-6">$0</p>
                <ul className="space-y-2 text-slate-300 mb-8">
                    <li>✓ 10 free generations</li>
                    <li>✓ Standard-resolution previews</li>
                </ul>
                <button onClick={onTryForFree} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded transition-colors">Start Generating</button>
            </div>
             <div className="bg-slate-800/50 p-8 rounded-lg border-2 border-indigo-500 text-center relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
                <h4 className="text-2xl font-bold mb-2">Pro</h4>
                <p className="text-slate-400 mb-6">For professionals and enthusiasts.</p>
                <p className="text-4xl font-bold mb-1">$19 <span className="text-lg font-normal text-slate-400">/ month</span></p>
                <ul className="space-y-2 text-slate-300 mb-8">
                    <li>✓ Unlimited generations</li>
                    <li>✓ High-resolution downloads</li>
                    <li>✓ Commercial license</li>
                </ul>
                <button onClick={onTryForFree} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700">Go Pro</button>
            </div>
        </div>
      </div>

    </div>
  );
};