import React from 'react';
import { Project, DocumentType } from '../types';
import { FileText, Presentation, Plus, Trash2 } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onCreateNew: () => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectCard: React.FC<{ project: Project; onSelect: () => void; onDelete: () => void; }> = ({ project, onSelect, onDelete }) => {
  const Icon = project.docType === DocumentType.WORD ? FileText : Presentation;
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the onSelect from firing
    onDelete();
  };

  return (
    <div
      onClick={onSelect}
      className="bg-base-200 p-6 rounded-lg shadow-lg hover:shadow-primary/50 transition-shadow duration-300 cursor-pointer group flex flex-col justify-between relative"
    >
      <button 
        onClick={handleDeleteClick} 
        className="absolute top-2 right-2 p-2 text-base-content/50 hover:text-error hover:bg-error/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete project"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-base-content mb-2 group-hover:text-primary transition-colors pr-8">{project.title}</h3>
            <Icon className="w-8 h-8 text-secondary flex-shrink-0" />
        </div>
        <p className="text-sm text-base-content/70 line-clamp-3">{project.mainTopic}</p>
      </div>
       <div className="text-xs text-base-content/50 mt-4">
        {project.structure.length} sections
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onCreateNew, onDeleteProject }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Projects Dashboard</h2>
        <button
          onClick={onCreateNew}
          className="bg-primary hover:bg-primary-focus text-primary-content font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onSelect={() => onSelectProject(project)} 
            onDelete={() => onDeleteProject(project.id)}
          />
        ))}
         <div
            onClick={onCreateNew}
            className="border-2 border-dashed border-base-300 rounded-lg flex flex-col items-center justify-center p-6 text-base-content/60 hover:border-primary hover:text-primary transition-colors duration-300 cursor-pointer min-h-[200px]"
        >
            <Plus className="h-10 w-10 mb-2" />
            <span className="font-semibold">Create a New Project</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;