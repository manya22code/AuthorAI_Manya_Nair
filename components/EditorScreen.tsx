import React, { useState, useCallback } from 'react';
import { Project, DocumentSection, DocumentType } from '../types';
import { generateContentForSection, refineContent } from '../services/geminiService';
import { ArrowLeft, Download, FileText, Presentation, ThumbsUp, ThumbsDown, MessageSquare, Send, Wand2, Loader2 } from 'lucide-react';
import { Remarkable } from 'remarkable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const md = new Remarkable();

interface EditorScreenProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onBack: () => void;
}

const SectionEditor: React.FC<{
  section: DocumentSection;
  index: number;
  project: Project;
  onUpdateSection: (updatedSection: DocumentSection) => void;
}> = ({ section, index, project, onUpdateSection }) => {
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState(section.feedback.comment || '');

  const handleGenerate = useCallback(async () => {
    onUpdateSection({ ...section, status: 'generating' });
    try {
      const content = await generateContentForSection(project.mainTopic, section.title, project.docType);
      onUpdateSection({ ...section, content, status: 'done' });
    } catch (error) {
      console.error("Content generation failed", error);
      onUpdateSection({ ...section, status: 'error' });
    }
  }, [project.mainTopic, section, project.docType, onUpdateSection]);

  const handleRefine = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementPrompt.trim()) return;
    setIsRefining(true);
    try {
      const refined = await refineContent(section.content, refinementPrompt);
      const newRefinement = { prompt: refinementPrompt, generatedContent: section.content, timestamp: new Date().toISOString() };
      onUpdateSection({ ...section, content: refined, refinements: [...section.refinements, newRefinement] });
      setRefinementPrompt('');
    } catch (error) {
      console.error("Refinement failed", error);
    } finally {
      setIsRefining(false);
    }
  }, [section, refinementPrompt, onUpdateSection]);

  const handleLike = () => onUpdateSection({ ...section, feedback: { ...section.feedback, liked: true }});
  const handleDislike = () => onUpdateSection({ ...section, feedback: { ...section.feedback, liked: false }});
  const handleSaveComment = () => onUpdateSection({ ...section, feedback: { ...section.feedback, comment }});

  const sectionLabel = project.docType === DocumentType.WORD ? "Section" : "Slide";

  return (
    <div className="bg-base-200 p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-2xl font-bold mb-4 text-secondary">{`${index + 1}. ${section.title}`}</h3>
      
      {section.status === 'pending' && (
        <div className="text-center p-8">
            <button onClick={handleGenerate} className="bg-primary hover:bg-primary-focus text-primary-content font-bold py-3 px-6 rounded-lg flex items-center mx-auto transition-transform transform hover:scale-105">
                <Wand2 className="mr-2 h-5 w-5"/> Generate Content
            </button>
        </div>
      )}

      {section.status === 'generating' && (
        <div className="flex justify-center items-center p-8 text-base-content/80">
          <Loader2 className="animate-spin mr-3 h-8 w-8 text-primary"/>
          Generating content...
        </div>
      )}

      {section.status === 'error' && (
        <div className="text-center p-8 text-error">
          <p>Failed to generate content. Please try again.</p>
          <button onClick={handleGenerate} className="mt-4 bg-error hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
            Retry
          </button>
        </div>
      )}

      {section.status === 'done' && (
        <div>
          <div className="prose prose-invert max-w-none bg-base-300 p-4 rounded-md min-h-[150px]" dangerouslySetInnerHTML={{ __html: md.render(section.content) }} />

          <div className="mt-4 pt-4 border-t border-base-300">
            <h4 className="font-semibold mb-2">Refine & Review</h4>
            <form onSubmit={handleRefine} className="flex items-center space-x-2 mb-4">
              <input type="text" value={refinementPrompt} onChange={e => setRefinementPrompt(e.target.value)} placeholder="e.g., 'Make this more formal', 'Add statistics'" className="flex-grow p-2 bg-base-100 rounded-md focus:ring-2 focus:ring-secondary outline-none"/>
              <button type="submit" disabled={isRefining} className="bg-secondary hover:bg-secondary-focus text-secondary-content font-bold py-2 px-4 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                {isRefining ? <Loader2 className="animate-spin h-5 w-5" /> : 'Refine'}
              </button>
            </form>
            <div className="flex items-center space-x-2">
              <button onClick={handleLike} className={`p-2 rounded-full transition-colors ${section.feedback.liked === true ? 'bg-success/20 text-success' : 'hover:bg-success/10'}`}>
                  <ThumbsUp className="h-5 w-5"/>
              </button>
               <button onClick={handleDislike} className={`p-2 rounded-full transition-colors ${section.feedback.liked === false ? 'bg-error/20 text-error' : 'hover:bg-error/10'}`}>
                  <ThumbsDown className="h-5 w-5"/>
              </button>
              <button onClick={() => setShowCommentBox(!showCommentBox)} className={`p-2 rounded-full transition-colors ${showCommentBox ? 'bg-info/20 text-info' : 'hover:bg-info/10'}`}>
                  <MessageSquare className="h-5 w-5"/>
              </button>
            </div>
            {showCommentBox && (
                <div className="mt-3">
                    <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} placeholder="Add your private notes..." className="w-full p-2 bg-base-100 rounded-md focus:ring-2 focus:ring-info outline-none"></textarea>
                    <button onClick={handleSaveComment} className="mt-1 text-sm bg-info/80 hover:bg-info text-white font-bold py-1 px-3 rounded-md">Save Comment</button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EditorScreen: React.FC<EditorScreenProps> = ({ project, onUpdateProject, onBack }) => {

  const handleUpdateSection = (index: number) => (updatedSection: DocumentSection) => {
    const newStructure = [...project.structure];
    newStructure[index] = updatedSection;
    onUpdateProject({ ...project, structure: newStructure });
  };

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleExport = async () => {
    
    try {
        // 1. Save current state first (Optional but good practice)
        // await handleSaveProject(); 

        // 2. Request Download
        const response = await fetch(`http://127.0.0.1:8000/export/${project.id}`, {
            method: 'POST',
        });

        if (!response.ok) throw new Error("Export failed");

        // 3. Handle Blob Download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title}.${project.docType === 'docx' ? 'docx' : 'pptx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
    } catch (error) {
        console.error("Download failed", error);
        alert("Failed to export document. Ensure the project is saved in the backend.");
    }
};

  const Icon = project.docType === DocumentType.WORD ? FileText : Presentation;

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-start mb-6">
            <div>
                 <button onClick={onBack} className="flex items-center text-sm text-secondary hover:underline mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                </button>
                <h2 className="text-3xl font-bold flex items-center"><Icon className="mr-3 h-8 w-8 text-primary"/>{project.title}</h2>
                <p className="text-base-content/70 mt-1 max-w-2xl">{project.mainTopic}</p>
            </div>
            <button onClick={handleExport} className="bg-success hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105 whitespace-nowrap mt-2">
                <Download className="mr-2 h-5 w-5"/> Export Document
            </button>
        </div>
      
      <div>
        {project.structure.map((section, index) => (
          <SectionEditor
            key={section.id}
            section={section}
            index={index}
            project={project}
            onUpdateSection={handleUpdateSection(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default EditorScreen;