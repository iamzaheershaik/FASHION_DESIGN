import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
    generatePatternImage, 
    virtualTryOn, 
    recolorImage, 
    generatePromptIdeas, 
    enhancePrompt, 
    analyzeImage, 
    generateBorderPromptFromImage,
    getTrendForecasts,
    getSustainableSuggestions,
    generateTechPack,
    generateEcommerceCopy
} from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import type { User } from '../types';
import { PhotoIcon } from './icons/PhotoIcon';
import { ShareIcon } from './icons/ShareIcon';
import { jsPDF } from 'jspdf';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface StudioProps {
  user: User | null;
}

const outfitOptions = ['Saree with Blouse', 'Lehenga Choli', 'Punjabi Suit', 'Anarkali Suit', 'Kurta Pajama', 'Sherwani'];
const neckOptions = ['Round Neck', 'V-Neck', 'Boat Neck', 'Sweetheart Neck', 'High Neck', 'Square Neck'];
const cameraViews = ['Front', 'Three-Quarter', 'Full Body', 'Back', 'Left Side', 'Right Side'];
const modelSizes = ['Standard', 'XL', 'XXL', 'XXXL'];
const fabricTypes = ['Auto', 'Silk', 'Cotton', 'Chiffon', 'Georgette', 'Velvet', 'Brocade', 'Linen', 'Denim'];
const environments = ['Minimalist Studio', 'Sunny Beach', 'Lush Garden', 'Urban Street', 'Evening Gala', 'Royal Palace Interior'];
const poses = ['Standing', 'Walking', 'Hands on Hips', 'Seated Gracefully', 'Twirling'];
const designEras = ['Default', 'Mughal', 'Art Deco', 'Victorian', '60s Psychedelic', 'Japanese Ukiyo-e'];

const wearingStyles: { [key: string]: string[] } = {
  'Saree with Blouse': ['Standard Nivi Drape', 'Gujarati (Seedha Pallu)', 'Bengali (Athpourey)', 'Maharashtrian (Nauvari)', 'South Indian (Madisar)', 'Lehenga Saree Drape'],
  'Lehenga Choli': ['Standard Dupatta Drape', 'Gujarati Dupatta Drape', 'Dupatta Over Head (Bridal)', 'Cape Style Dupatta'],
  'Punjabi Suit': ['Standard Kameez', 'Patiala Salwar Style', 'Sharara Style'],
  'Anarkali Suit': ['Standard Anarkali', 'Floor-Length Anarkali', 'Jacket Style Anarkali'],
  'Kurta Pajama': ['Classic Kurta Pajama', 'Kurta with Dhoti', 'Pathani Suit Style'],
  'Sherwani': ['Classic Sherwani', 'Indo-Western Sherwani', 'Jodhpuri Sherwani'],
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// MODALS
const SourcePatternModal: React.FC<{ top: string | null; bottom: string | null; border: string | null; onClose: () => void; useSingle: boolean;}> = ({ top, bottom, border, onClose, useSingle }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-4xl w-full border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-200 mb-4">Source Fabrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {!useSingle && top && (
                    <div>
                        <h3 className="font-semibold text-slate-400 mb-2 text-center">Top / Blouse</h3>
                        <img src={top} alt="Top pattern" className="w-full aspect-square rounded-md object-cover"/>
                    </div>
                )}
                 {bottom && (
                    <div className={useSingle && !border ? "md:col-span-3" : ""}>
                        <h3 className="font-semibold text-slate-400 mb-2 text-center">{useSingle ? 'Main Fabric' : 'Bottom / Main'}</h3>
                        <img src={bottom} alt="Bottom pattern" className="w-full aspect-square rounded-md object-cover"/>
                    </div>
                 )}
                 {border && (
                    <div>
                        <h3 className="font-semibold text-slate-400 mb-2 text-center">Border / Lining</h3>
                        <img src={border} alt="Border pattern" className="w-full aspect-square rounded-md object-cover"/>
                    </div>
                 )}
            </div>
            <div className="text-right">
                <button onClick={onClose} className="mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors">Close</button>
            </div>
        </div>
    </div>
);

const TrendForecasterModal: React.FC<{ trends: any[], onSelect: (prompt: string) => void, onClose: () => void, isLoading: boolean }> = ({ trends, onSelect, onClose, isLoading }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-200 mb-4">AI Trend Forecast</h2>
            {isLoading ? <div className="flex justify-center items-center h-48"><ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-400" /></div> :
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {trends.map((trend, i) => (
                    <div key={i} className="bg-slate-700/50 p-4 rounded-lg">
                        <h3 className="font-bold text-indigo-400">{trend.name}</h3>
                        <p className="text-sm text-slate-400 mt-1 mb-3">{trend.description}</p>
                        <button onClick={() => onSelect(trend.prompt)} className="w-full text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-md transition-colors">
                            Use this Trend
                        </button>
                    </div>
                ))}
            </div>}
            <button onClick={onClose} className="mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors">Close</button>
        </div>
    </div>
);

const TechPackModal: React.FC<{ data: any, onClose: () => void, isLoading: boolean }> = ({ data, onClose, isLoading }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-200 mb-4">AI-Generated Tech Pack</h2>
            {isLoading ? <div className="flex justify-center items-center h-48"><ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-400" /></div> :
            data ? (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div>
                        <h3 className="font-bold text-indigo-400">Outfit Name</h3>
                        <p className="text-slate-300 bg-slate-700 p-2 rounded">{data.outfit_name}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-400">Description</h3>
                        <p className="text-sm text-slate-400 bg-slate-700 p-2 rounded">{data.description}</p>
                    </div>
                     <div>
                        <h3 className="font-bold text-indigo-400">Fabric Recommendation</h3>
                        <p className="text-slate-300 bg-slate-700 p-2 rounded">{data.fabric_recommendation}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-400">Color Palette</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {data.color_palette?.map((color: any) => (
                                <div key={color.hex} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-md">
                                    <div className="w-5 h-5 rounded border border-slate-500" style={{ backgroundColor: color.hex }}></div>
                                    <span className="text-sm">{color.name} ({color.hex})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-400">Construction Notes</h3>
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1 bg-slate-700 p-3 rounded">
                            {data.construction_notes?.map((note: string, i: number) => <li key={i}>{note}</li>)}
                        </ul>
                    </div>
                </div>
            ) : <div className="text-slate-400 h-48 flex items-center justify-center">No data generated yet. Click "Generate Tech Pack" again.</div>
            }
             <div className="text-right">
                <button onClick={onClose} className="mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors">Close</button>
            </div>
        </div>
    </div>
);

const EcommerceCopyModal: React.FC<{ data: any, onClose: () => void, isLoading: boolean, onCopy: (text: string) => void }> = ({ data, onClose, isLoading, onCopy }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-700" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-200 mb-4">AI E-commerce Copywriter</h2>
                {isLoading ? <div className="flex justify-center items-center h-48"><ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-400" /></div> :
                data ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-indigo-400">Product Title</h3>
                                <button onClick={() => onCopy(data.title)} className="p-1 rounded-md hover:bg-slate-600"><ClipboardIcon className="w-4 h-4 text-slate-400"/></button>
                            </div>
                            <p className="text-slate-300 bg-slate-700 p-2 rounded">{data.title}</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-indigo-400">Description</h3>
                                <button onClick={() => onCopy(data.description)} className="p-1 rounded-md hover:bg-slate-600"><ClipboardIcon className="w-4 h-4 text-slate-400"/></button>
                            </div>
                            <p className="text-sm text-slate-400 whitespace-pre-wrap bg-slate-700 p-2 rounded">{data.description}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-indigo-400">SEO Keywords</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {data.keywords?.map((keyword: string) => (
                                    <span key={keyword} className="bg-slate-600 text-xs font-medium px-2 py-1 rounded-full">{keyword}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : <div className="text-slate-400 h-48 flex items-center justify-center">No data generated yet. Click "AI Copywriter" again.</div>
                }
                <div className="text-right">
                    <button onClick={onClose} className="mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};


export const Studio: React.FC<StudioProps> = ({ user }) => {
  const [prompt, setPrompt] = useState('Vintage floral chintz, muted color palette');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Advanced Step 1 State
  const [fabricType, setFabricType] = useState(fabricTypes[0]);
  const [designEra, setDesignEra] = useState(designEras[0]);
  const [sustainableSuggestions, setSustainableSuggestions] = useState<any[] | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [trends, setTrends] = useState([]);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);

  // Border State
  const [borderPrompt, setBorderPrompt] = useState('Intricate gold thread embroidery, paisley motifs');
  const [generatedBorderImage, setGeneratedBorderImage] = useState<string>('');
  const [isGeneratingBorder, setIsGeneratingBorder] = useState(false);
  const [borderError, setBorderError] = useState<string | null>(null);
  
  const [remainingCredits, setRemainingCredits] = useState(10);
  
  // Try-On State
  const [selectedOutfit, setSelectedOutfit] = useState(outfitOptions[0]);
  const [selectedNeckType, setSelectedNeckType] = useState(neckOptions[0]);
  const [selectedModelSize, setSelectedModelSize] = useState(modelSizes[0]);
  const [selectedWearingStyle, setSelectedWearingStyle] = useState(wearingStyles[selectedOutfit][0]);
  const [modelImage, setModelImage] = useState<string>('');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizationError, setVisualizationError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string | null>(null);

  // Advanced Step 2 State
  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);
  const [selectedPose, setSelectedPose] = useState(poses[0]);
  const [addAccessories, setAddAccessories] = useState(false);

  // Post-Visualization State
  const [showTechPackModal, setShowTechPackModal] = useState(false);
  const [techPackData, setTechPackData] = useState(null);
  const [isGeneratingTechPack, setIsGeneratingTechPack] = useState(false);
  const [showEcommerceCopyModal, setShowEcommerceCopyModal] = useState(false);
  const [ecommerceCopyData, setEcommerceCopyData] = useState(null);
  const [isGeneratingEcommerceCopy, setIsGeneratingEcommerceCopy] = useState(false);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const borderDesignInputRef = useRef<HTMLInputElement>(null);
  
  const [topMaterial, setTopMaterial] = useState<string | null>(null);
  const [bottomMaterial, setBottomMaterial] = useState<string | null>(null);
  const [borderMaterial, setBorderMaterial] = useState<string | null>(null);
  const [useSingleMaterial, setUseSingleMaterial] = useState(true);
  const bottomMaterialInputRef = useRef<HTMLInputElement>(null);
  const borderMaterialInputRef = useRef<HTMLInputElement>(null);

  const [showSourcePatternModal, setShowSourcePatternModal] = useState(false);
  const [isGeneratingBorderPrompt, setIsGeneratingBorderPrompt] = useState(false);
  const [isPowerToolsOpen, setPowerToolsOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const credits = isAdmin ? 'Unlimited' : remainingCredits;

  useEffect(() => {
    const availableStyles = wearingStyles[selectedOutfit] || ['Standard'];
    setSelectedWearingStyle(availableStyles[0]);
  }, [selectedOutfit]);
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage('');
    setModelImage('');
    setSustainableSuggestions(null);
    
    try {
      const imageResult = await generatePatternImage(prompt, { fabricType });
      if (imageResult) {
        setGeneratedImage(`data:image/png;base64,${imageResult}`);
        if (!isAdmin) setRemainingCredits(prev => prev - 1);
        
        setIsFetchingSuggestions(true);
        const suggestions = await getSustainableSuggestions(fabricType);
        setSustainableSuggestions(suggestions);
        setIsFetchingSuggestions(false);

      } else {
        setError("Could not generate a pattern from that prompt.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, fabricType, isAdmin]);
  
  const handleGenerateBorder = useCallback(async () => {
    setIsGeneratingBorder(true);
    setBorderError(null);
    setGeneratedBorderImage('');
    try {
        const imageResult = await generatePatternImage(borderPrompt, {});
        if (imageResult) {
            const b64Image = `data:image/png;base64,${imageResult}`;
            setGeneratedBorderImage(b64Image);
            if (!isAdmin) setRemainingCredits(prev => prev - 1);
        } else {
            setBorderError("Could not generate a border from that prompt.");
        }
    } catch (e) {
        setBorderError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsGeneratingBorder(false);
    }
  }, [borderPrompt, isAdmin]);

  const handleVisualize = useCallback(async (view: string) => {
    const materialForTop = useSingleMaterial ? null : topMaterial;
    if (!bottomMaterial) {
        setVisualizationError("Please set a fabric for the Bottom/Main part.");
        return;
    }
    if (!useSingleMaterial && !materialForTop) {
        setVisualizationError("Please set a fabric for the Top part in Two-Piece mode.");
        return;
    }

    setIsVisualizing(true);
    setVisualizationError(null);
    setActiveView(view);
    setTechPackData(null);
    setEcommerceCopyData(null);

    try {
        const topB64 = materialForTop?.split(',')[1] ?? null;
        const bottomB64 = bottomMaterial.split(',')[1];
        const borderB64 = borderMaterial?.split(',')[1] ?? null;

        const imageResult = await virtualTryOn(topB64, bottomB64, borderB64, selectedOutfit, selectedNeckType, selectedModelSize, `${view} view`, selectedWearingStyle, fabricType, selectedEnvironment, selectedPose, addAccessories);
        if (imageResult) {
            setModelImage(`data:image/png;base64,${imageResult}`);
        } else {
            setVisualizationError("Could not visualize the pattern on a model.");
        }
    } catch (e) {
        setVisualizationError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsVisualizing(false);
    }
  }, [bottomMaterial, topMaterial, borderMaterial, useSingleMaterial, selectedOutfit, selectedNeckType, selectedModelSize, selectedWearingStyle, fabricType, selectedEnvironment, selectedPose, addAccessories]);

  const handleFetchTrends = async () => {
    setShowTrendsModal(true);
    setIsFetchingTrends(true);
    try {
        const trendData = await getTrendForecasts();
        setTrends(trendData);
    } catch(e) {
        console.error("Failed to fetch trends", e)
    } finally {
        setIsFetchingTrends(false);
    }
  };
  
  const handleGenerateTechPack = async () => {
    if (!modelImage) return;
    setShowTechPackModal(true);
    setIsGeneratingTechPack(true);
    try {
        const details = { outfit: selectedOutfit, style: selectedWearingStyle, fabric: fabricType };
        const data = await generateTechPack(modelImage.split(',')[1], details);
        setTechPackData(data);
    } catch (e) { console.error("Failed to generate tech pack", e) } 
    finally { setIsGeneratingTechPack(false); }
  };

  const handleGenerateEcommerceCopy = async () => {
    if (!modelImage) return;
    setShowEcommerceCopyModal(true);
    setIsGeneratingEcommerceCopy(true);
    try {
        const details = { outfit: selectedOutfit, style: selectedWearingStyle, fabric: fabricType, pattern_prompt: prompt };
        const data = await generateEcommerceCopy(details);
        setEcommerceCopyData(data);
    } catch (e) { console.error("Failed to generate e-commerce copy", e) }
    finally { setIsGeneratingEcommerceCopy(false); }
  };
  
  useEffect(() => {
    if (designEra === 'Default' || prompt.includes('style pattern')) return; // Avoid re-triggering
    const eraPrompts: Record<string, string> = {
        'Mughal': 'An opulent Mughal-era miniature painting style pattern, intricate florals, elephants, and paisley motifs, with gold inlay.',
        'Art Deco': 'A bold Art Deco geometric pattern, featuring sharp angles, symmetrical sunbursts, and metallic gold lines on a dark background.',
        'Victorian': 'A dense Victorian-era pattern with romantic florals, damask elements, and ornate filigree in a rich, dark color palette.',
        '60s Psychedelic': 'A vibrant 1960s psychedelic pattern with swirling paisley, abstract waves, and high-contrast, hallucinogenic colors.',
        'Japanese Ukiyo-e': 'A Japanese Ukiyo-e woodblock print style pattern, featuring elegant cranes, serene landscapes, and stylized waves.',
    }
    setPrompt(eraPrompts[designEra] || prompt);
  }, [designEra]);

  const handleMaterialUpload = async (file: File, type: 'top' | 'bottom' | 'border' | 'inspiration') => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      if (type === 'bottom') setBottomMaterial(base64);
      else if (type === 'top') setTopMaterial(base64);
      else if (type === 'border') {
        setGeneratedBorderImage(base64);
        setBorderMaterial(base64);
      } else if (type === 'inspiration') {
        setGeneratedImage(base64);
        setBottomMaterial(base64); // Auto-assign to main fabric
        const analysisPrompt = await analyzeImage(base64.split(',')[1]);
        setPrompt(analysisPrompt);
      }
    } catch (error) {
      console.error("Error uploading file", error);
      setError("Failed to upload image.");
    }
  };
  
  const handleGenerateMatchingBorder = useCallback(async () => {
    if (!generatedImage) return;
    setIsGeneratingBorderPrompt(true);
    setBorderError(null);
    try {
        const imageB64 = generatedImage.split(',')[1];
        const newPrompt = await generateBorderPromptFromImage(imageB64);
        setBorderPrompt(newPrompt);
    } catch (e) {
        setBorderError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsGeneratingBorderPrompt(false);
    }
  }, [generatedImage]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt) return;
    setIsEnhancing(true);
    try {
        const enhanced = await enhancePrompt(prompt);
        setPrompt(enhanced);
    } catch(e) {
        console.error("Failed to enhance prompt", e);
    } finally {
        setIsEnhancing(false);
    }
  }, [prompt]);
  
  const handleDownload = (image: string, filename: string) => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadPdf = () => {
    if (!modelImage || !techPackData) return;
    const doc = new jsPDF();
    doc.text("FashionAI Design Tech Pack", 10, 10);
    doc.addImage(modelImage, 'PNG', 10, 20, 80, 80);
    
    doc.text(`Outfit: ${techPackData.outfit_name}`, 100, 25);
    doc.text(`Fabric: ${techPackData.fabric_recommendation}`, 100, 35);
    
    let yPos = 45;
    doc.text("Color Palette:", 100, yPos);
    yPos += 5;
    techPackData.color_palette.forEach((c: any) => {
        doc.setFillColor(c.hex);
        doc.rect(100, yPos, 5, 5, 'F');
        doc.text(`${c.name} - ${c.hex}`, 110, yPos + 4);
        yPos += 8;
    });

    doc.text("Construction Notes:", 10, 110);
    doc.text(techPackData.construction_notes.join("\n"), 10, 120, { maxWidth: 180 });

    doc.save(`${techPackData.outfit_name.replace(/\s+/g, '_')}_TechPack.pdf`);
  };

  return (
    <>
      {showTrendsModal && <TrendForecasterModal trends={trends} onSelect={(p) => { setPrompt(p); setShowTrendsModal(false); }} onClose={() => setShowTrendsModal(false)} isLoading={isFetchingTrends} />}
      {showTechPackModal && <TechPackModal data={techPackData} onClose={() => setShowTechPackModal(false)} isLoading={isGeneratingTechPack} />}
      {showEcommerceCopyModal && <EcommerceCopyModal data={ecommerceCopyData} onCopy={handleCopyToClipboard} onClose={() => setShowEcommerceCopyModal(false)} isLoading={isGeneratingEcommerceCopy} />}
      {showSourcePatternModal && (bottomMaterial || topMaterial) && <SourcePatternModal top={topMaterial} bottom={bottomMaterial} border={borderMaterial} useSingle={useSingleMaterial} onClose={() => setShowSourcePatternModal(false)} />}
      {copied && <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">Copied to clipboard!</div>}

      <div className="container mx-auto px-4 py-8">
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Step 1: Create Your Design</h2>
            <p className="text-sm text-slate-400 mt-2">You have <span className={`font-bold ${isAdmin ? 'text-green-400' : 'text-indigo-400'}`}>{credits}</span> generations left.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700 flex flex-col">
                <h3 className="text-xl font-bold mb-4">Main Fabric</h3>
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1">Text Prompt</label>
                  <textarea id="prompt" rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Art deco geometric shapes..."/>
                   <div className="flex gap-2 mt-2">
                     <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex-1 flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm disabled:opacity-50">
                       {isEnhancing ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <SparklesIcon className="w-4 h-4"/>} Enhance
                     </button>
                      <button onClick={() => inspirationInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-3 rounded-md transition-colors text-sm">
                        <PhotoIcon className="w-4 h-4"/> From Image
                     </button>
                     <input type="file" ref={inspirationInputRef} onChange={(e) => e.target.files && handleMaterialUpload(e.target.files[0], 'inspiration')} accept="image/*" className="hidden"/>
                   </div>
                </div>
                <div className="my-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                    <button onClick={() => setPowerToolsOpen(!isPowerToolsOpen)} className="w-full p-3 font-semibold text-left flex justify-between items-center">
                        <span>Power Tools</span>
                        <svg className={`w-5 h-5 transition-transform ${isPowerToolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isPowerToolsOpen && (
                        <div className="p-4 border-t border-slate-700 space-y-4">
                            <button onClick={handleFetchTrends} className="w-full text-sm flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 font-semibold py-2 px-3 rounded-md">AI Trend Forecaster</button>
                            <div>
                                <label htmlFor="designEra" className="block text-xs font-medium text-slate-400 mb-1">Design Era Helper</label>
                                <select id="designEra" value={designEra} onChange={(e) => setDesignEra(e.target.value)} className="w-full text-sm bg-slate-700 border border-slate-600 rounded-md p-2 text-white">
                                    {designEras.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="fabricType" className="block text-xs font-medium text-slate-400 mb-1">Fabric Realism Engine</label>
                                <select id="fabricType" value={fabricType} onChange={(e) => setFabricType(e.target.value)} className="w-full text-sm bg-slate-700 border border-slate-600 rounded-md p-2 text-white">
                                    {fabricTypes.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50">
                  {isLoading ? <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Generating...</> : <><SparklesIcon className="w-5 h-5" /> Generate Pattern</>}
                </button>
                <div className="aspect-square mt-4 bg-slate-900 rounded-md flex items-center justify-center overflow-hidden">
                  {isLoading ? <div className="text-center"><ArrowPathIcon className="w-10 h-10 animate-spin mx-auto text-indigo-400"/></div> : generatedImage ? <img src={generatedImage} alt="Generated pattern" className="w-full h-full object-cover"/> : <div className="text-center text-slate-500"><SparklesIcon className="w-10 h-10 mx-auto"/><p>Main fabric will appear here.</p></div>}
                </div>
                 {error && <div className="mt-2 text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{error}</div>}
                 {sustainableSuggestions && (
                    <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                        <h4 className="font-semibold text-green-300 text-sm mb-2">Sustainable Fabric Alternatives</h4>
                        <div className="space-y-1">
                            {sustainableSuggestions.map(s => <p key={s.name} className="text-xs text-slate-300"><strong className="text-green-400">{s.name}:</strong> {s.reason}</p>)}
                        </div>
                    </div>
                 )}
                 {generatedImage && (
                    <div className="mt-4 space-y-2">
                        <button onClick={handleGenerateMatchingBorder} disabled={isGeneratingBorderPrompt} className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
                            {isGeneratingBorderPrompt ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                            Generate Matching Border
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setTopMaterial(generatedImage)} disabled={!generatedImage || useSingleMaterial} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                Use as Top
                            </button>
                            <button onClick={() => setBottomMaterial(generatedImage)} disabled={!generatedImage} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50">
                                Use as Bottom/Main
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div id="border-design-card" className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700 flex flex-col">
                <h3 className="text-xl font-bold mb-4">Border / Lining Fabric</h3>
                <div className="flex-grow">
                    <label htmlFor="border-prompt" className="block text-sm font-medium text-slate-300 mb-1">Text Prompt</label>
                    <textarea id="border-prompt" rows={3} value={borderPrompt} onChange={(e) => setBorderPrompt(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Intricate gold thread embroidery..."/>
                </div>
                <div className="flex gap-2 mt-2">
                    <button onClick={handleGenerateBorder} disabled={isGeneratingBorder} className="flex-1 flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50">
                        {isGeneratingBorder ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                        <span>Generate</span>
                    </button>
                    <button onClick={() => borderDesignInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-3 rounded-md transition-colors">
                        <PhotoIcon className="w-5 h-5"/>
                        <span>Upload</span>
                    </button>
                    <input type="file" ref={borderDesignInputRef} onChange={(e) => e.target.files && handleMaterialUpload(e.target.files[0], 'border')} accept="image/*" className="hidden"/>
                </div>
                <div className="aspect-square mt-4 bg-slate-900 rounded-md flex items-center justify-center overflow-hidden">
                    {isGeneratingBorder ? <div className="text-center"><ArrowPathIcon className="w-10 h-10 animate-spin mx-auto text-indigo-400"/></div> : generatedBorderImage ? <img src={generatedBorderImage} alt="Generated border pattern" className="w-full h-full object-cover"/> : <div className="text-center text-slate-500"><SparklesIcon className="w-10 h-10 mx-auto"/><p>Border will appear here.</p></div>}
                </div>
                {borderError && <div className="mt-2 text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{borderError}</div>}
                {generatedBorderImage && (
                    <button onClick={() => setBorderMaterial(generatedBorderImage)} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Use as Border
                    </button>
                )}
            </div>
          </div>
        </div>

        <div id="try-on-section" className="mt-8 pt-8 border-t border-slate-700">
            <h2 className="text-2xl font-bold text-center mb-6">Step 2: Virtual Try-On</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700 self-start">
                <h3 className="text-xl font-bold mb-4">Try-On Controls</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Fabric Mode</label>
                    <div className="flex items-center rounded-lg bg-slate-700 p-1">
                      <button onClick={() => setUseSingleMaterial(true)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${useSingleMaterial ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-600'}`}>Single</button>
                      <button onClick={() => setUseSingleMaterial(false)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${!useSingleMaterial ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-600'}`}>Two-Piece</button>
                    </div>
                  </div>
                  {!useSingleMaterial && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Top / Blouse Fabric</label>
                      <div className="mt-1 flex justify-center p-2 border-2 border-slate-600 border-dashed rounded-md h-24 items-center">{topMaterial ? <img src={topMaterial} className="max-h-full w-auto rounded-md" alt="Top fabric preview" /> : <p className="text-xs text-slate-500">Select from Step 1</p>}</div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{useSingleMaterial ? 'Main Fabric' : 'Bottom / Main Fabric'}</label>
                    <div className="mt-1 flex justify-center p-2 border-2 border-slate-600 border-dashed rounded-md h-24 items-center">{bottomMaterial ? <img src={bottomMaterial} className="max-h-full w-auto rounded-md" alt="Bottom fabric preview" /> : <p className="text-xs text-slate-500">Select from Step 1</p>}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Border / Lining (Optional)</label>
                    <div className="mt-1 flex justify-center p-2 border-2 border-slate-600 border-dashed rounded-md h-24 items-center">{borderMaterial ? <img src={borderMaterial} className="max-h-full w-auto rounded-md" alt="Border fabric preview" /> : <p className="text-xs text-slate-500">Select from Step 1</p>}</div>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-700 space-y-4">
                    <div><label htmlFor="outfit" className="block text-sm font-medium text-slate-300 mb-1">Outfit Type</label><select id="outfit" value={selectedOutfit} onChange={(e) => setSelectedOutfit(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white">{outfitOptions.map(opt => <option key={opt}>{opt}</option>)}</select></div>
                    <div><label htmlFor="neck" className="block text-sm font-medium text-slate-300 mb-1">Neck Style</label><select id="neck" value={selectedNeckType} onChange={(e) => setSelectedNeckType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white">{neckOptions.map(opt => <option key={opt}>{opt}</option>)}</select></div>
                    <div><label htmlFor="size" className="block text-sm font-medium text-slate-300 mb-1">Model Size</label><select id="size" value={selectedModelSize} onChange={(e) => setSelectedModelSize(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white">{modelSizes.map(opt => <option key={opt}>{opt}</option>)}</select></div>
                    <div><label htmlFor="style" className="block text-sm font-medium text-slate-300 mb-1">Wearing Style</label><select id="style" value={selectedWearingStyle} onChange={(e) => setSelectedWearingStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white">{(wearingStyles[selectedOutfit] || []).map(opt => <option key={opt}>{opt}</option>)}</select></div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-700 space-y-4">
                    <h4 className="text-lg font-semibold">Advanced Styling</h4>
                    <div><label htmlFor="environment" className="block text-sm font-medium text-slate-300 mb-1">Environment</label><select id="environment" value={selectedEnvironment} onChange={(e) => setSelectedEnvironment(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white">{environments.map(opt => <option key={opt}>{opt}</option>)}</select></div>
                     <div><label htmlFor="pose" className="block text-sm font-medium text-slate-300 mb-1">Model Pose</label><select id="pose" value={selectedPose} onChange={(e) => setSelectedPose(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white">{poses.map(opt => <option key={opt}>{opt}</option>)}</select></div>
                    <div className="flex items-center"><input type="checkbox" id="add-accessories" checked={addAccessories} onChange={(e) => setAddAccessories(e.target.checked)} className="h-4 w-4 rounded border-slate-500 text-indigo-600 focus:ring-indigo-500" /><label htmlFor="add-accessories" className="ml-2 block text-sm text-slate-400">Add AI-Suggested Accessories</label></div>
                </div>
                <button onClick={() => handleVisualize(cameraViews[0])} disabled={isVisualizing || (!bottomMaterial)} className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-indigo-700 disabled:opacity-50">
                  {isVisualizing && activeView === cameraViews[0] ? <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Visualizing...</> : <>Visualize on Model</>}
                </button>
              </div>

              <div className="md:col-span-2 bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Model Preview</h3>
                <div className="aspect-square bg-slate-900 rounded-md flex items-center justify-center overflow-hidden">
                   {isVisualizing ? <div className="text-center"><ArrowPathIcon className="w-12 h-12 animate-spin mx-auto text-indigo-400"/><p className="mt-2 text-slate-400">Generating photorealistic model...</p></div> : modelImage ? <img src={modelImage} alt="Model visualization" className="w-full h-full object-contain"/> : <div className="text-center text-slate-500"><PhotoIcon className="w-12 h-12 mx-auto"/><p>Your virtual model will appear here.</p></div>}
                </div>
                {visualizationError && <div className="mt-2 text-sm text-red-400 bg-red-900/50 p-2 rounded-md">{visualizationError}</div>}
                {modelImage && !isVisualizing && (
                  <>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        <button onClick={() => setShowSourcePatternModal(true)} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors">View Source Fabrics</button>
                        {cameraViews.slice(1).map(view => (
                            <button key={view} onClick={() => handleVisualize(view)} disabled={isVisualizing} className="text-sm bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors">
                               {isVisualizing && activeView === view ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : `${view} View`}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <h4 className="text-center font-bold mb-2">Business & Production Tools</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button onClick={handleGenerateTechPack} disabled={isGeneratingTechPack} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
                                {isGeneratingTechPack ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : null} Generate Tech Pack
                            </button>
                            <button onClick={handleGenerateEcommerceCopy} disabled={isGeneratingEcommerceCopy} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
                                {isGeneratingEcommerceCopy ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : null} AI Copywriter
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button onClick={() => handleDownload(modelImage, 'fashion_ai_model.png')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">Download Image</button>
                        <button onClick={handleDownloadPdf} disabled={!techPackData} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">Download Tech Pack (PDF)</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
      </div>
    </>
  );
};