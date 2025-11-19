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
    generateEcommerceCopy,
    extractColorPalette
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

interface SavedDesign {
  id: string;
  image: string;
  prompt: string;
  palette: {name: string, hex: string}[];
  timestamp: number;
}

const outfitOptions = [
    'Saree with Blouse', 
    'Lehenga Choli', 
    'Punjabi Suit', 
    'Anarkali Suit', 
    'Sharara Set', 
    'Palazzo Suit', 
    'Co-ord Set', 
    'Indo-Western Gown', 
    'Kaftan Set', 
    'Dhoti Saree', 
    'Kurta Pajama', 
    'Sherwani'
];
const neckOptions = ['Round Neck', 'V-Neck', 'Boat Neck', 'Sweetheart Neck', 'High Neck', 'Square Neck', 'Halter Neck', 'Off-Shoulder'];
const cameraViews = ['Front', 'Three-Quarter', 'Full Body', 'Back', 'Left Side', 'Right Side', 'Close-Up Portrait'];
const modelSizes = ['Standard', 'XL', 'XXL', 'XXXL'];
const fabricTypes = ['Auto', 'Silk', 'Cotton', 'Chiffon', 'Georgette', 'Velvet', 'Brocade', 'Linen', 'Denim', 'Organza'];
const environments = ['Minimalist Studio', 'Sunny Beach', 'Lush Garden', 'Urban Street', 'Evening Gala', 'Royal Palace Interior', 'Runway'];
const poses = ['Standing', 'Walking', 'Hands on Hips', 'Seated Gracefully', 'Twirling', 'Side Profile'];
const designEras = ['Default', 'Mughal', 'Art Deco', 'Victorian', '60s Psychedelic', 'Japanese Ukiyo-e', 'Contemporary Abstract'];

const wearingStyles: { [key: string]: string[] } = {
  'Saree with Blouse': ['Standard Nivi Drape', 'Gujarati (Seedha Pallu)', 'Bengali (Athpourey)', 'Maharashtrian (Nauvari)', 'South Indian (Madisar)', 'Lehenga Saree Drape', 'Belted Saree Style', 'Pant Saree Drape'],
  'Lehenga Choli': ['Standard Dupatta Drape', 'Gujarati Dupatta Drape', 'Dupatta Over Head (Bridal)', 'Cape Style Dupatta', 'Double Dupatta Style'],
  'Punjabi Suit': ['Standard Kameez', 'Patiala Salwar Style', 'Dhoti Salwar Style'],
  'Anarkali Suit': ['Standard Anarkali', 'Floor-Length Anarkali', 'Jacket Style Anarkali', 'Angrakha Style'],
  'Sharara Set': ['Classic Sharara', 'Peplum Sharara', 'Jacket Style Sharara', 'Tiered Sharara'],
  'Palazzo Suit': ['Straight Cut Kurta', 'A-Line Kurta', 'Short Kurta', 'Asymmetric Kurta'],
  'Co-ord Set': ['Crop Top & Pants', 'Blazer & Trousers', 'Shirt & Skirt', 'Tunic & Culottes'],
  'Indo-Western Gown': ['Standard Gown', 'Saree-Style Gown', 'Cape-Style Gown'],
  'Kaftan Set': ['Standard Kaftan', 'Cinched Waist Kaftan', 'Kaftan with Pant'],
  'Dhoti Saree': ['Standard Dhoti Drape', 'Pre-stitched Dhoti Saree'],
  'Kurta Pajama': ['Classic Kurta Pajama', 'Kurta with Dhoti', 'Pathani Suit Style', 'Asymmetric Kurta'],
  'Sherwani': ['Classic Sherwani', 'Indo-Western Sherwani', 'Jodhpuri Sherwani', 'Angrakha Sherwani'],
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

// NEOBRUTALIST UI COMPONENTS
const NeoButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'accent' }> = ({ className, variant = 'primary', ...props }) => {
    const baseStyle = "font-bold py-2 px-4 border-3 border-neo-black shadow-neo transition-all active:translate-y-1 active:shadow-neo-hover uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-1";
    const variants = {
        primary: "bg-neo-yellow text-neo-black hover:bg-yellow-300",
        secondary: "bg-white text-neo-black hover:bg-gray-50",
        accent: "bg-neo-pink text-neo-black hover:bg-pink-300",
    };
    return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
};

const NeoCard: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className, title }) => (
    <div className={`bg-white border-3 border-neo-black shadow-neo p-6 ${className}`}>
        {title && <h3 className="text-xl font-display font-black mb-4 uppercase border-b-3 border-neo-black pb-2">{title}</h3>}
        {children}
    </div>
);

const NeoSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, className, ...props }) => (
    <div className="w-full">
        <label className="block text-xs font-black text-neo-black mb-1 uppercase tracking-widest">{label}</label>
        <div className="relative">
            <select className={`w-full bg-white border-3 border-neo-black px-3 py-2 text-neo-black font-medium focus:outline-none focus:ring-2 focus:ring-neo-purple appearance-none rounded-none ${className}`} {...props} />
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neo-black">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    </div>
);

const NeoInput: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className, ...props }) => (
    <div className="w-full">
        <label className="block text-xs font-black text-neo-black mb-1 uppercase tracking-widest">{label}</label>
        <textarea className={`w-full bg-gray-50 border-3 border-neo-black p-3 text-neo-black focus:outline-none focus:shadow-neo transition-shadow placeholder:text-gray-400 font-medium rounded-none ${className}`} {...props} />
    </div>
);

// MODALS
const SourcePatternModal: React.FC<{ top: string | null; bottom: string | null; border: string | null; onClose: () => void; useSingle: boolean;}> = ({ top, bottom, border, onClose, useSingle }) => (
    <div className="fixed inset-0 bg-neo-yellow/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white border-3 border-neo-black shadow-neo-lg p-6 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-display font-black text-neo-black mb-6 border-b-3 border-neo-black pb-2">Source Fabrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {!useSingle && top && (
                    <div className="border-3 border-neo-black p-2">
                        <h3 className="font-bold text-neo-black mb-3 text-center uppercase tracking-wider text-xs bg-neo-purple border-b-3 border-neo-black -mx-2 -mt-2 py-2">Top / Blouse</h3>
                        <img src={top} alt="Top pattern" className="w-full aspect-square object-cover border-2 border-neo-black"/>
                    </div>
                )}
                 {bottom && (
                    <div className={`${useSingle && !border ? "md:col-span-3" : ""} border-3 border-neo-black p-2`}>
                        <h3 className="font-bold text-neo-black mb-3 text-center uppercase tracking-wider text-xs bg-neo-blue border-b-3 border-neo-black -mx-2 -mt-2 py-2">{useSingle ? 'Main Fabric' : 'Bottom / Main'}</h3>
                        <img src={bottom} alt="Bottom pattern" className="w-full aspect-square object-cover border-2 border-neo-black"/>
                    </div>
                 )}
                 {border && (
                    <div className="border-3 border-neo-black p-2">
                        <h3 className="font-bold text-neo-black mb-3 text-center uppercase tracking-wider text-xs bg-neo-orange border-b-3 border-neo-black -mx-2 -mt-2 py-2">Border / Lining</h3>
                        <img src={border} alt="Border pattern" className="w-full aspect-square object-cover border-2 border-neo-black"/>
                    </div>
                 )}
            </div>
            <div className="text-right mt-8">
                <NeoButton onClick={onClose} variant="secondary">Close Panel</NeoButton>
            </div>
        </div>
    </div>
);

const TrendForecasterModal: React.FC<{ trends: any[], onSelect: (prompt: string) => void, onClose: () => void, isLoading: boolean }> = ({ trends, onSelect, onClose, isLoading }) => (
    <div className="fixed inset-0 bg-neo-purple/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white border-3 border-neo-black shadow-neo-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-display font-black text-neo-black mb-6 border-b-3 border-neo-black pb-2 flex items-center gap-2"><LightBulbIcon className="w-6 h-6"/> WGSN AI Forecast</h2>
            {isLoading ? <div className="flex justify-center items-center h-48"><ArrowPathIcon className="w-12 h-12 animate-spin text-neo-black" /></div> :
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {trends.map((trend, i) => (
                    <div key={i} className="bg-neo-bg border-3 border-neo-black p-4 hover:shadow-neo transition-all">
                        <h3 className="font-black text-neo-purple text-lg uppercase mb-2">{trend.name}</h3>
                        <p className="text-sm text-neo-black mb-4 leading-relaxed font-medium">{trend.description}</p>
                        <NeoButton onClick={() => onSelect(trend.prompt)} className="w-full text-xs">
                            Apply Trend
                        </NeoButton>
                    </div>
                ))}
            </div>}
            <div className="mt-6 text-right">
                <NeoButton onClick={onClose} variant="secondary">Close</NeoButton>
            </div>
        </div>
    </div>
);

const TechPackModal: React.FC<{ data: any, onClose: () => void, isLoading: boolean }> = ({ data, onClose, isLoading }) => (
    <div className="fixed inset-0 bg-neo-green/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white border-3 border-neo-black shadow-neo-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-display font-black text-neo-black mb-6 border-b-3 border-neo-black pb-2 flex items-center gap-2"><ClipboardIcon className="w-6 h-6"/> Tech Pack Spec</h2>
            {isLoading ? <div className="flex justify-center items-center h-48"><ArrowPathIcon className="w-12 h-12 animate-spin text-neo-black" /></div> :
            data ? (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="bg-neo-bg p-4 border-3 border-neo-black">
                        <h3 className="font-black text-neo-black uppercase text-xs tracking-widest mb-1">Outfit Name</h3>
                        <p className="text-xl text-neo-purple font-display font-bold">{data.outfit_name}</p>
                    </div>
                    <div>
                        <h3 className="font-black text-neo-black uppercase text-xs tracking-widest mb-2">Description</h3>
                        <p className="text-sm text-neo-black bg-white p-3 border-2 border-neo-black">{data.description}</p>
                    </div>
                     <div>
                        <h3 className="font-black text-neo-black uppercase text-xs tracking-widest mb-2">Fabrication</h3>
                        <p className="text-neo-black bg-white p-3 border-2 border-neo-black">{data.fabric_recommendation}</p>
                    </div>
                    <div>
                        <h3 className="font-black text-neo-black uppercase text-xs tracking-widest mb-2">Color Palette</h3>
                        <div className="flex flex-wrap gap-3 mt-1">
                            {data.color_palette?.map((color: any) => (
                                <div key={color.hex} className="flex flex-col items-center bg-white p-2 border-2 border-neo-black w-24">
                                    <div className="w-full h-10 border-2 border-neo-black mb-2" style={{ backgroundColor: color.hex }}></div>
                                    <span className="text-xs font-bold text-neo-black truncate w-full text-center">{color.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase">{color.hex}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-black text-neo-black uppercase text-xs tracking-widest mb-2">Construction Notes</h3>
                        <ul className="list-none text-sm text-neo-black space-y-2 bg-white p-4 border-2 border-neo-black">
                            {data.construction_notes?.map((note: string, i: number) => <li key={i} className="flex gap-2"><span className="text-neo-pink font-bold">></span> {note}</li>)}
                        </ul>
                    </div>
                </div>
            ) : <div className="text-gray-500 h-48 flex items-center justify-center font-bold">No data generated yet.</div>
            }
             <div className="text-right mt-6">
                <NeoButton onClick={onClose} variant="secondary">Close</NeoButton>
            </div>
        </div>
    </div>
);

const EcommerceCopyModal: React.FC<{ data: any, onClose: () => void, isLoading: boolean, onCopy: (text: string) => void }> = ({ data, onClose, isLoading, onCopy }) => {
    return (
        <div className="fixed inset-0 bg-neo-orange/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white border-3 border-neo-black shadow-neo-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-display font-black text-neo-black mb-6 border-b-3 border-neo-black pb-2 flex items-center gap-2"><SparklesIcon className="w-6 h-6"/> Copywriter</h2>
                {isLoading ? <div className="flex justify-center items-center h-48"><ArrowPathIcon className="w-12 h-12 animate-spin text-neo-black" /></div> :
                data ? (
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-black text-neo-black uppercase text-xs tracking-widest">Product Title</h3>
                                <button onClick={() => onCopy(data.title)} className="p-1 border-2 border-neo-black hover:bg-neo-yellow transition-colors"><ClipboardIcon className="w-4 h-4 text-neo-black"/></button>
                            </div>
                            <p className="text-lg text-neo-black font-display font-bold bg-neo-bg p-3 border-2 border-neo-black">{data.title}</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-black text-neo-black uppercase text-xs tracking-widest">Description</h3>
                                <button onClick={() => onCopy(data.description)} className="p-1 border-2 border-neo-black hover:bg-neo-yellow transition-colors"><ClipboardIcon className="w-4 h-4 text-neo-black"/></button>
                            </div>
                            <p className="text-sm text-neo-black whitespace-pre-wrap bg-white p-4 border-2 border-neo-black leading-relaxed">{data.description}</p>
                        </div>
                        <div>
                            <h3 className="font-black text-neo-black uppercase text-xs tracking-widest mb-2">SEO Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {data.keywords?.map((keyword: string) => (
                                    <span key={keyword} className="bg-neo-purple border-2 border-neo-black text-white text-xs font-bold px-3 py-1 shadow-neo-sm">{keyword}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : <div className="text-gray-500 h-48 flex items-center justify-center font-bold">No data generated yet.</div>
                }
                <div className="text-right mt-6">
                    <NeoButton onClick={onClose} variant="secondary">Close</NeoButton>
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
  
  const [palette, setPalette] = useState<{name: string, hex: string}[]>([]);
  const [hoveredColor, setHoveredColor] = useState<{name: string, hex: string} | null>(null);
  const [savedPatterns, setSavedPatterns] = useState<SavedDesign[]>([]);
  const [isExtractingPalette, setIsExtractingPalette] = useState(false);

  const [fabricType, setFabricType] = useState(fabricTypes[0]);
  const [designEra, setDesignEra] = useState(designEras[0]);
  const [sustainableSuggestions, setSustainableSuggestions] = useState<any[] | null>(null);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [trends, setTrends] = useState([]);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);

  const [borderPrompt, setBorderPrompt] = useState('Intricate gold thread embroidery, paisley motifs');
  const [generatedBorderImage, setGeneratedBorderImage] = useState<string>('');
  const [isGeneratingBorder, setIsGeneratingBorder] = useState(false);
  const [borderError, setBorderError] = useState<string | null>(null);
  
  const [remainingCredits, setRemainingCredits] = useState(10);
  
  const [selectedOutfit, setSelectedOutfit] = useState(outfitOptions[0]);
  const [selectedNeckType, setSelectedNeckType] = useState(neckOptions[0]);
  const [selectedModelSize, setSelectedModelSize] = useState(modelSizes[0]);
  const [selectedWearingStyle, setSelectedWearingStyle] = useState(wearingStyles[selectedOutfit][0]);
  const [modelImage, setModelImage] = useState<string>('');
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizationError, setVisualizationError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string | null>(null);

  const [selectedEnvironment, setSelectedEnvironment] = useState(environments[0]);
  const [selectedPose, setSelectedPose] = useState(poses[0]);
  const [addAccessories, setAddAccessories] = useState(false);

  const [showTechPackModal, setShowTechPackModal] = useState(false);
  const [techPackData, setTechPackData] = useState(null);
  const [isGeneratingTechPack, setIsGeneratingTechPack] = useState(false);
  const [showEcommerceCopyModal, setShowEcommerceCopyModal] = useState(false);
  const [ecommerceCopyData, setEcommerceCopyData] = useState(null);
  const [isGeneratingEcommerceCopy, setIsGeneratingEcommerceCopy] = useState(false);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const borderDesignInputRef = useRef<HTMLInputElement>(null);
  
  const [topMaterial, setTopMaterial] = useState<string | null>(null);
  const [bottomMaterial, setBottomMaterial] = useState<string | null>(null);
  const [borderMaterial, setBorderMaterial] = useState<string | null>(null);
  const [useSingleMaterial, setUseSingleMaterial] = useState(true);
  
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
    setPalette([]);
    
    try {
      const imageResult = await generatePatternImage(prompt, { fabricType });
      if (imageResult) {
        const b64 = `data:image/png;base64,${imageResult}`;
        setGeneratedImage(b64);
        if (!isAdmin) setRemainingCredits(prev => prev - 1);
        
        setIsFetchingSuggestions(true);
        setIsExtractingPalette(true);
        
        Promise.all([
            getSustainableSuggestions(fabricType),
            extractColorPalette(imageResult)
        ]).then(([suggestions, extractedPalette]) => {
            setSustainableSuggestions(suggestions);
            setPalette(extractedPalette);
            setIsFetchingSuggestions(false);
            setIsExtractingPalette(false);
        });

      } else {
        setError("Could not generate a pattern from that prompt.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, fabricType, isAdmin]);

  const handleSaveDesign = () => {
    if (!generatedImage) return;
    const newDesign: SavedDesign = {
        id: Date.now().toString(),
        image: generatedImage,
        prompt: prompt,
        palette: palette,
        timestamp: Date.now()
    };
    setSavedPatterns(prev => [newDesign, ...prev]);
  };

  const loadDesign = (design: SavedDesign) => {
      setGeneratedImage(design.image);
      setPrompt(design.prompt);
      setPalette(design.palette);
      setBottomMaterial(design.image);
  };
  
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
    if (designEra === 'Default' || prompt.includes('style pattern')) return;
    const eraPrompts: Record<string, string> = {
        'Mughal': 'An opulent Mughal-era miniature painting style pattern, intricate florals, elephants, and paisley motifs, with gold inlay.',
        'Art Deco': 'A bold Art Deco geometric pattern, featuring sharp angles, symmetrical sunbursts, and metallic gold lines on a dark background.',
        'Victorian': 'A dense Victorian-era pattern with romantic florals, damask elements, and ornate filigree in a rich, dark color palette.',
        '60s Psychedelic': 'A vibrant 1960s psychedelic pattern with swirling paisley, abstract waves, and high-contrast, hallucinogenic colors.',
        'Japanese Ukiyo-e': 'A Japanese Ukiyo-e woodblock print style pattern, featuring elegant cranes, serene landscapes, and stylized waves.',
        'Contemporary Abstract': 'A modern, abstract expressionist pattern with bold brushstrokes, splashing colors, and asymmetrical composition.'
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
        setBottomMaterial(base64);
        const analysisPrompt = await analyzeImage(base64.split(',')[1]);
        setPrompt(analysisPrompt);
        setIsExtractingPalette(true);
        const extractedPalette = await extractColorPalette(base64.split(',')[1]);
        setPalette(extractedPalette);
        setIsExtractingPalette(false);
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
      {copied && <div className="fixed top-24 right-4 bg-neo-black text-white border-3 border-neo-white shadow-neo px-6 py-3 z-50 font-bold uppercase tracking-widest">Copied!</div>}

      <div className="container mx-auto px-4 py-8">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-3 border-neo-black pb-4">
            <div>
                <h2 className="text-5xl font-display font-black text-neo-black uppercase tracking-tighter">Atelier<span className="text-neo-pink">.</span></h2>
                <p className="text-neo-black mt-2 font-bold tracking-wide text-sm">Professional AI Design Suite</p>
            </div>
            <div className="bg-white border-3 border-neo-black shadow-neo px-4 py-2 mt-4 md:mt-0">
                <p className="text-xs font-black uppercase tracking-widest">Credits <span className={`ml-2 text-lg ${isAdmin ? 'text-neo-green' : 'text-neo-purple'}`}>{credits}</span></p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pattern Generator */}
            <NeoCard title="Fabrication" className="flex flex-col relative h-full">
                <div>
                  <NeoInput 
                    label="Design Prompt" 
                    rows={4} 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder="Describe your vision... e.g., Opulent baroque gold filigree on midnight velvet"
                  />
                   <div className="flex gap-2 mt-3">
                     <NeoButton onClick={handleEnhancePrompt} disabled={isEnhancing} variant="secondary" className="flex-1 flex items-center justify-center gap-2 text-xs">
                       {isEnhancing ? <ArrowPathIcon className="w-3 h-3 animate-spin"/> : <SparklesIcon className="w-3 h-3 text-neo-purple"/>} AI Enhance
                     </NeoButton>
                      <NeoButton onClick={() => inspirationInputRef.current?.click()} variant="secondary" className="flex-1 flex items-center justify-center gap-2 text-xs">
                        <PhotoIcon className="w-3 h-3 text-neo-blue"/> From Image
                     </NeoButton>
                     <input type="file" ref={inspirationInputRef} onChange={(e) => e.target.files && handleMaterialUpload(e.target.files[0], 'inspiration')} accept="image/*" className="hidden"/>
                   </div>
                </div>
                
                <div className="my-5 bg-white border-3 border-neo-black">
                    <button onClick={() => setPowerToolsOpen(!isPowerToolsOpen)} className="w-full p-3 font-bold text-xs text-neo-black text-left flex justify-between items-center hover:bg-gray-100 transition-colors uppercase tracking-widest">
                        <span>Studio Tools</span>
                        <svg className={`w-4 h-4 transition-transform border-2 border-neo-black p-0.5 ${isPowerToolsOpen ? 'rotate-180 bg-neo-black text-white' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isPowerToolsOpen && (
                        <div className="p-4 border-t-3 border-neo-black space-y-4 bg-neo-bg">
                            <NeoButton onClick={handleFetchTrends} variant="accent" className="w-full flex items-center justify-center gap-2">
                                <LightBulbIcon className="w-4 h-4"/> Access WGSN Trend Data
                            </NeoButton>
                            <div className="grid grid-cols-2 gap-4">
                                <NeoSelect label="Historical Era" id="designEra" value={designEra} onChange={(e) => setDesignEra(e.target.value)}>
                                    {designEras.map(opt => <option key={opt}>{opt}</option>)}
                                </NeoSelect>
                                <NeoSelect label="Material Simulation" id="fabricType" value={fabricType} onChange={(e) => setFabricType(e.target.value)}>
                                    {fabricTypes.map(opt => <option key={opt}>{opt}</option>)}
                                </NeoSelect>
                            </div>
                        </div>
                    )}
                </div>

                <NeoButton onClick={handleGenerate} disabled={isLoading} className="w-full flex items-center justify-center gap-2 text-lg py-4">
                  {isLoading ? <><ArrowPathIcon className="w-6 h-6 animate-spin" /> Weaving...</> : <><SparklesIcon className="w-6 h-6" /> Generate Fabric</>}
                </NeoButton>

                {/* Generated Image Area */}
                <div className="relative aspect-square mt-6 bg-white border-3 border-neo-black flex items-center justify-center overflow-hidden shadow-inner">
                  {isLoading ? <div className="text-center"><ArrowPathIcon className="w-12 h-12 animate-spin mx-auto text-neo-black opacity-50"/></div> : generatedImage ? <img src={generatedImage} alt="Generated pattern" className="w-full h-full object-cover"/> : <div className="text-center text-gray-400"><SparklesIcon className="w-12 h-12 mx-auto opacity-20"/><p className="mt-2 font-display font-bold uppercase tracking-widest">Canvas Empty</p></div>}
                  
                  {/* Color DNA Overlay */}
                   {generatedImage && !isLoading && (
                       <div className="absolute bottom-4 left-4 right-4 bg-white border-3 border-neo-black shadow-neo p-3">
                           <div className="flex justify-between items-center mb-2 min-h-[1.5rem]">
                               {hoveredColor ? (
                                   <div className="flex items-center gap-2 animate-fade-in">
                                        <div className="w-4 h-4 border-2 border-neo-black" style={{backgroundColor: hoveredColor.hex}}></div>
                                        <span className="text-xs font-bold text-neo-black uppercase tracking-wider">{hoveredColor.name} <span className="text-neo-purple ml-1">{hoveredColor.hex}</span></span>
                                   </div>
                               ) : (
                                   <div className="flex items-center justify-between w-full">
                                      <span className="text-[10px] text-neo-black uppercase tracking-widest font-black">Color DNA</span>
                                   </div>
                               )}
                               {isExtractingPalette && <ArrowPathIcon className="w-3 h-3 animate-spin text-neo-black"/>}
                           </div>
                           <div className="flex gap-2 justify-center">
                               {palette.map((color, idx) => (
                                   <button 
                                        key={idx} 
                                        onClick={() => handleCopyToClipboard(color.hex)}
                                        onMouseEnter={() => setHoveredColor(color)}
                                        onMouseLeave={() => setHoveredColor(null)}
                                        className="group relative w-8 h-8 border-2 border-neo-black shadow-sm hover:-translate-y-1 hover:shadow-md transition-all focus:outline-none" 
                                        style={{ backgroundColor: color.hex }}
                                   >
                                   </button>
                               ))}
                               {palette.length === 0 && !isExtractingPalette && <span className="text-xs text-gray-500 italic">No palette extracted</span>}
                           </div>
                       </div>
                   )}
                </div>
                 
                 {error && <div className="mt-3 text-sm text-neo-black font-bold bg-red-100 border-3 border-neo-black p-3 flex items-center gap-2"><ExclamationTriangleIcon className="w-4 h-4 text-red-600"/> {error}</div>}
                 
                 {sustainableSuggestions && (
                    <div className="mt-4 p-4 bg-neo-green/20 border-3 border-neo-black">
                        <h4 className="font-black text-neo-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2"><CheckIcon className="w-4 h-4"/> Sustainable Alternatives</h4>
                        <div className="space-y-2">
                            {sustainableSuggestions.map(s => <div key={s.name} className="text-xs text-neo-black"><strong className="underline">{s.name}:</strong> {s.reason}</div>)}
                        </div>
                    </div>
                 )}

                 {generatedImage && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <NeoButton onClick={handleGenerateMatchingBorder} disabled={isGeneratingBorderPrompt} variant="secondary" className="col-span-2 flex items-center justify-center gap-2 text-xs">
                            {isGeneratingBorderPrompt ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <SparklesIcon className="w-4 h-4 text-neo-purple"/>}
                            Generate Matching Lining/Border
                        </NeoButton>
                        <NeoButton onClick={() => setTopMaterial(generatedImage)} disabled={!generatedImage || useSingleMaterial} variant="secondary" className="text-xs">
                            Set as Top
                        </NeoButton>
                        <NeoButton onClick={() => setBottomMaterial(generatedImage)} disabled={!generatedImage} variant="secondary" className="text-xs">
                            Set as Main
                        </NeoButton>
                         <NeoButton onClick={handleSaveDesign} variant="accent" className="col-span-2 flex items-center justify-center gap-2 text-xs">
                            <ArrowPathIcon className="w-3 h-3"/> Save to Collection
                        </NeoButton>
                    </div>
                )}
            </NeoCard>

            {/* Right Column: Border & Instructions */}
            <div className="flex flex-col gap-6">
                <NeoCard title="Accents & Linings" className="flex flex-col gap-4">
                    <div className="flex-grow">
                        <NeoInput 
                            label="Accent Prompt" 
                            rows={2} 
                            value={borderPrompt} 
                            onChange={(e) => setBorderPrompt(e.target.value)} 
                            placeholder="e.g., Intricate gold thread embroidery..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <NeoButton onClick={handleGenerateBorder} disabled={isGeneratingBorder} className="flex-1 flex items-center justify-center gap-2 text-xs">
                            {isGeneratingBorder ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <SparklesIcon className="w-4 h-4"/>}
                            <span>Weave Accent</span>
                        </NeoButton>
                        <NeoButton onClick={() => borderDesignInputRef.current?.click()} variant="secondary" className="flex-1 flex items-center justify-center gap-2 text-xs">
                            <PhotoIcon className="w-4 h-4 text-neo-black"/>
                            <span>Upload</span>
                        </NeoButton>
                        <input type="file" ref={borderDesignInputRef} onChange={(e) => e.target.files && handleMaterialUpload(e.target.files[0], 'border')} accept="image/*" className="hidden"/>
                    </div>
                    <div className="aspect-[3/1] bg-white border-3 border-neo-black flex items-center justify-center overflow-hidden relative">
                        {isGeneratingBorder ? <div className="text-center"><ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-neo-black"/></div> : generatedBorderImage ? <img src={generatedBorderImage} alt="Generated border pattern" className="w-full h-full object-cover"/> : <div className="text-center text-gray-400"><p className="text-xs font-bold uppercase tracking-widest">Accent fabric preview</p></div>}
                         {generatedBorderImage && (
                             <div className="absolute inset-0 bg-neo-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                <NeoButton onClick={() => setBorderMaterial(generatedBorderImage)} className="text-xs">Use This</NeoButton>
                             </div>
                        )}
                    </div>
                    {borderError && <div className="mt-2 text-xs text-red-600 font-bold bg-red-100 border-2 border-neo-black p-2">{borderError}</div>}
                </NeoCard>
                
                {/* Collection Dock (Mini) */}
                {savedPatterns.length > 0 && (
                    <NeoCard title="Atelier Collection" className="flex-grow">
                        <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
                            {savedPatterns.map((design) => (
                                <div key={design.id} onClick={() => loadDesign(design)} className="group relative aspect-square border-2 border-neo-black hover:border-neo-purple transition-all cursor-pointer shadow-neo-sm hover:shadow-neo hover:-translate-y-1">
                                    <img src={design.image} className="w-full h-full object-cover" alt="Saved design"/>
                                </div>
                            ))}
                        </div>
                    </NeoCard>
                )}
            </div>
          </div>
        </div>

        <div id="try-on-section" className="mt-16 pt-12 border-t-3 border-neo-black">
            <div className="text-center mb-10">
                 <h2 className="text-4xl font-display font-black text-neo-black uppercase">Virtual Runway</h2>
                 <p className="text-neo-black mt-2 font-medium bg-neo-yellow inline-block px-3 border-2 border-neo-black shadow-neo-sm transform rotate-1">Visualize your collection on the models.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 self-start">
                <NeoCard title="Configuration">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between bg-neo-bg p-3 border-2 border-neo-black">
                        <label className="text-xs font-black text-neo-black uppercase tracking-widest">Mode</label>
                        <div className="flex items-center border-2 border-neo-black bg-white">
                            <button onClick={() => setUseSingleMaterial(true)} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border-r-2 border-neo-black ${useSingleMaterial ? 'bg-neo-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Unified</button>
                            <button onClick={() => setUseSingleMaterial(false)} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${!useSingleMaterial ? 'bg-neo-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Two-Piece</button>
                        </div>
                    </div>
                  
                    <div className="grid grid-cols-3 gap-2">
                       {!useSingleMaterial && (
                        <div className="relative group">
                           <div className="w-full aspect-square bg-white border-2 border-neo-black flex items-center justify-center overflow-hidden">
                               {topMaterial ? <img src={topMaterial} className="w-full h-full object-cover" alt="Top" /> : <span className="text-[9px] font-bold text-gray-400 uppercase">Top</span>}
                           </div>
                           <div className="mt-1 text-[9px] text-center font-bold text-neo-black uppercase tracking-wider bg-neo-purple text-white border-2 border-neo-black">Top</div>
                        </div>
                      )}
                      <div className="relative group">
                           <div className="w-full aspect-square bg-white border-2 border-neo-black flex items-center justify-center overflow-hidden">
                               {bottomMaterial ? <img src={bottomMaterial} className="w-full h-full object-cover" alt="Main" /> : <span className="text-[9px] font-bold text-gray-400 uppercase">Main</span>}
                           </div>
                           <div className="mt-1 text-[9px] text-center font-bold text-neo-black uppercase tracking-wider bg-neo-blue text-white border-2 border-neo-black">{useSingleMaterial ? 'Body' : 'Bottom'}</div>
                      </div>
                      <div className="relative group">
                           <div className="w-full aspect-square bg-white border-2 border-neo-black flex items-center justify-center overflow-hidden">
                               {borderMaterial ? <img src={borderMaterial} className="w-full h-full object-cover" alt="Trim" /> : <span className="text-[9px] font-bold text-gray-400 uppercase">Trim</span>}
                           </div>
                           <div className="mt-1 text-[9px] text-center font-bold text-neo-black uppercase tracking-wider bg-neo-orange text-white border-2 border-neo-black">Accent</div>
                      </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t-3 border-neo-black">
                    <NeoSelect label="Garment Type" value={selectedOutfit} onChange={(e) => setSelectedOutfit(e.target.value)}>
                        {outfitOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </NeoSelect>
                    <NeoSelect label="Neckline" value={selectedNeckType} onChange={(e) => setSelectedNeckType(e.target.value)}>
                        {neckOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </NeoSelect>
                    <div className="grid grid-cols-2 gap-3">
                        <NeoSelect label="Size" value={selectedModelSize} onChange={(e) => setSelectedModelSize(e.target.value)}>
                            {modelSizes.map(opt => <option key={opt}>{opt}</option>)}
                        </NeoSelect>
                        <NeoSelect label="Style/Drape" value={selectedWearingStyle} onChange={(e) => setSelectedWearingStyle(e.target.value)}>
                            {(wearingStyles[selectedOutfit] || []).map(opt => <option key={opt}>{opt}</option>)}
                        </NeoSelect>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t-3 border-neo-black">
                    <h4 className="text-xs font-black text-white bg-neo-black inline-block px-2 py-1 uppercase tracking-widest">Staging</h4>
                    <NeoSelect label="Environment" value={selectedEnvironment} onChange={(e) => setSelectedEnvironment(e.target.value)}>
                        {environments.map(opt => <option key={opt}>{opt}</option>)}
                    </NeoSelect>
                    <NeoSelect label="Pose" value={selectedPose} onChange={(e) => setSelectedPose(e.target.value)}>
                        {poses.map(opt => <option key={opt}>{opt}</option>)}
                    </NeoSelect>
                    <div className="flex items-center bg-white border-2 border-neo-black p-2 shadow-neo-sm">
                        <input type="checkbox" id="add-accessories" checked={addAccessories} onChange={(e) => setAddAccessories(e.target.checked)} className="h-5 w-5 rounded-none border-2 border-neo-black text-neo-black focus:ring-0" />
                        <label htmlFor="add-accessories" className="ml-2 block text-xs font-bold text-neo-black uppercase tracking-wide">Stylist Accessories</label>
                    </div>
                  </div>
                </div>
                <NeoButton onClick={() => handleVisualize(cameraViews[0])} disabled={isVisualizing || (!bottomMaterial)} className="w-full mt-6">
                  {isVisualizing && activeView === cameraViews[0] ? <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Fitting...</> : <>Virtual Try-On</>}
                </NeoButton>
                </NeoCard>
              </div>

              <div className="md:col-span-2">
                <NeoCard className="h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-display font-black text-neo-black uppercase">Runway Preview</h3>
                        {modelImage && <button onClick={() => setShowSourcePatternModal(true)} className="text-xs bg-neo-yellow text-neo-black font-bold uppercase tracking-wider border-2 border-neo-black px-2 py-1 shadow-neo-sm hover:shadow-none hover:translate-y-0.5 transition-all">View Swatches</button>}
                    </div>
                    
                    <div className="aspect-[3/4] bg-neo-bg border-3 border-neo-black flex items-center justify-center overflow-hidden relative">
                    {isVisualizing ? (
                            <div className="text-center space-y-4">
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 border-4 border-neo-black"></div>
                                    <div className="absolute inset-0 bg-neo-pink animate-ping opacity-75"></div>
                                </div>
                                <p className="text-neo-black font-bold font-display text-xl bg-white px-4 py-1 border-2 border-neo-black inline-block">Fitting Model...</p>
                            </div>
                    ) : modelImage ? (
                        <img src={modelImage} alt="Model visualization" className="w-full h-full object-contain"/>
                    ) : (
                        <div className="text-center text-gray-500">
                            <PhotoIcon className="w-24 h-24 mx-auto opacity-20 mb-4"/>
                            <p className="font-display font-black text-2xl text-neo-black uppercase">Awaiting Configuration</p>
                            <p className="text-sm mt-2 font-bold bg-neo-yellow inline-block px-2 border-2 border-neo-black transform -rotate-1">Select fabrics to begin the show.</p>
                        </div>
                    )}
                    </div>
                    
                    {visualizationError && <div className="mt-4 text-sm text-red-600 font-bold bg-red-100 border-3 border-neo-black p-3 shadow-neo-sm">{visualizationError}</div>}
                    
                    {modelImage && !isVisualizing && (
                    <div className="animate-fade-in-up">
                        <div className="mt-6 flex flex-wrap gap-2 justify-center">
                            {cameraViews.slice(1).map(view => (
                                <button key={view} onClick={() => handleVisualize(view)} disabled={isVisualizing} className={`text-xs font-bold py-2 px-4 border-2 border-neo-black uppercase tracking-wider transition-all ${isVisualizing && activeView === view ? 'bg-neo-black text-white' : 'bg-white text-neo-black hover:bg-neo-purple hover:text-white shadow-neo-sm'}`}>
                                {isVisualizing && activeView === view ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : `${view}`}
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t-3 border-neo-black">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <NeoButton onClick={handleGenerateTechPack} disabled={isGeneratingTechPack} variant="secondary" className="flex items-center justify-center gap-2">
                                    {isGeneratingTechPack ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ClipboardIcon className="w-4 h-4"/>} Generate Tech Pack
                                </NeoButton>
                                <NeoButton onClick={handleGenerateEcommerceCopy} disabled={isGeneratingEcommerceCopy} variant="secondary" className="flex items-center justify-center gap-2">
                                    {isGeneratingEcommerceCopy ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4"/>} AI Marketing Copy
                                </NeoButton>
                                <NeoButton onClick={() => handleDownload(modelImage, 'fashion_ai_model.png')} variant="accent">Download High-Res Image</NeoButton>
                                <NeoButton onClick={handleDownloadPdf} disabled={!techPackData} variant="accent">Download PDF Pack</NeoButton>
                            </div>
                        </div>
                    </div>
                    )}
                </NeoCard>
              </div>
            </div>
          </div>
      </div>
    </>
  );
};