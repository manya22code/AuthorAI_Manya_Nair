import React, { useState, useCallback } from 'react';
import { Project, DocumentType, DocumentSection } from '../types';
import { suggestOutline } from '../services/geminiService';
import { FileText, Presentation, Trash2, Plus, ArrowLeft, BrainCircuit, Loader2, Wand2 } from 'lucide-react';

interface ConfigurationScreenProps {
  onFinishConfiguration: (newProject: Project) => void;
  onBack: () => void;
}

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({ onFinishConfiguration, onBack }) => {
  const [title, setTitle] = useState('');
  const [mainTopic, setMainTopic] = useState('');
  const [docType, setDocType] = useState<DocumentType>(DocumentType.WORD);
  const [structure, setStructure] = useState<DocumentSection[]>([
    { id: `s-${Date.now()}`, title: '', content: '', refinements: [], feedback: {}, status: 'pending' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStructureChange = (index: number, value: string) => {
    const newStructure = [...structure];
    newStructure[index].title = value;
    setStructure(newStructure);
  };

  const addSection = () => {
    setStructure([
      ...structure,
      { id: `s-${Date.now()}`, title: '', content: '', refinements: [], feedback: {}, status: 'pending' },
    ]);
  };

  const removeSection = (index: number) => {
    if (structure.length > 1) {
      const newStructure = structure.filter((_, i) => i !== index);
      setStructure(newStructure);
    }
  };

  const handleAiSuggest = useCallback(async () => {
    if (!mainTopic) {
      alert("Please enter a main topic first.");
      return;
    }
    setIsLoading(true);
    try {
      const titles = await suggestOutline(mainTopic, docType);
      // FIX: Explicitly type `newStructure` as `DocumentSection[]` to prevent
      // TypeScript from widening the type of the `status` property to `string`.
      const newStructure: DocumentSection[] = titles.map(title => ({
        id: `s-${Date.now()}-${Math.random()}`,
        title,
        content: '',
        refinements: [],
        feedback: {},
        status: 'pending'
      }));
      setStructure(newStructure);
    } catch (error) {
      console.error("Failed to get AI suggestions", error);
      alert("Could not fetch AI suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [mainTopic, docType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !mainTopic || structure.some(s => !s.title)) {
        alert("Please fill out all fields, including all section/slide titles.");
        return;
    }
    const newProject: Omit<Project, 'id'> = {
      title,
      mainTopic,
      docType,
      structure,
    };
    onFinishConfiguration(newProject as Project);
  };
  
  const sectionLabel = docType === DocumentType.WORD ? 'Section' : 'Slide';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <button onClick={onBack} className="flex items-center text-sm text-secondary hover:underline mb-6">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
        </button>
      <h2 className="text-3xl font-bold mb-6 text-center">Create New Document</h2>
      <form onSubmit={handleSubmit} className="space-y-8 bg-base-200 p-8 rounded-lg shadow-lg">
        
        {/* Step 1: Basic Info */}
        <div className="p-6 border border-base-300 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><span className="bg-primary text-primary-content rounded-full h-8 w-8 text-sm flex items-center justify-center mr-3">1</span> Project Details</h3>
            <div className="space-y-4">
                <input type="text" placeholder="Project Title (e.g., 'Q4 Sales Report')" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-3 bg-base-300 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                <textarea placeholder="Main Topic or Prompt (e.g., 'A market analysis of the EV industry in 2025')" value={mainTopic} onChange={e => setMainTopic(e.target.value)} required rows={3} className="w-full p-3 bg-base-300 rounded-md focus:ring-2 focus:ring-primary outline-none" />
            </div>
        </div>

        {/* Step 2: Document Type */}
        <div className="p-6 border border-base-300 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><span className="bg-primary text-primary-content rounded-full h-8 w-8 text-sm flex items-center justify-center mr-3">2</span> Document Type</h3>
            <div className="grid grid-cols-2 gap-4">
                <div onClick={() => setDocType(DocumentType.WORD)} className={`p-4 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${docType === DocumentType.WORD ? 'border-primary bg-primary/10' : 'border-base-300'}`}>
                    <FileText className="h-10 w-10 mb-2" />
                    <span className="font-semibold">Word (.docx)</span>
                </div>
                <div onClick={() => setDocType(DocumentType.POWERPOINT)} className={`p-4 border-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all ${docType === DocumentType.POWERPOINT ? 'border-primary bg-primary/10' : 'border-base-300'}`}>
                    <Presentation className="h-10 w-10 mb-2" />
                    <span className="font-semibold">PowerPoint (.pptx)</span>
                </div>
            </div>
        </div>

        {/* Step 3: Outline */}
        <div className="p-6 border border-base-300 rounded-lg">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold flex items-center"><span className="bg-primary text-primary-content rounded-full h-8 w-8 text-sm flex items-center justify-center mr-3">3</span> Define Outline</h3>
                <button type="button" onClick={handleAiSuggest} disabled={isLoading || !mainTopic} className="bg-secondary hover:bg-secondary-focus text-secondary-content font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Wand2 className="mr-2 h-5 w-5" />}
                    AI-Suggest Outline
                </button>
             </div>
             <div className="space-y-3">
                {structure.map((sec, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <span className="text-base-content/70 font-semibold">{sectionLabel} {index + 1}:</span>
                        <input type="text" placeholder={`${sectionLabel} Title`} value={sec.title} onChange={e => handleStructureChange(index, e.target.value)} required className="flex-grow p-2 bg-base-300 rounded-md focus:ring-2 focus:ring-primary outline-none" />
                        <button type="button" onClick={() => removeSection(index)} disabled={structure.length <= 1} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                            <Trash2 className="h-5 w-5"/>
                        </button>
                    </div>
                ))}
             </div>
             <button type="button" onClick={addSection} className="mt-4 flex items-center text-sm text-secondary hover:underline">
                <Plus className="mr-1 h-4 w-4"/> Add {sectionLabel}
             </button>
        </div>
        
        <div className="flex justify-end pt-4">
             <button type="submit" className="bg-success hover:bg-green-700 text-white font-bold py-3 px-8 text-lg rounded-lg flex items-center transition-transform transform hover:scale-105">
                Start Generating <BrainCircuit className="ml-2 h-6 w-6"/>
            </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationScreen;