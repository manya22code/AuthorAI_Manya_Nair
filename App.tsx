import React, { useState, useCallback, useEffect } from 'react';
import { Project, AppState } from './types';
import Dashboard from './components/Dashboard';
import ConfigurationScreen from './components/ConfigurationScreen';
import EditorScreen from './components/EditorScreen';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';

// HARDCODED FOR DEMO (In a real app, this comes from the Login response)
const USER_ID = 1; 
const API_URL = "http://127.0.0.1:8000";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // --- 1. LOAD PROJECTS FROM DB ---
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects/${USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        
        // FIX: Map Backend (snake_case) to Frontend (camelCase)
        const mappedProjects = data.map((p: any) => ({
            id: p.id,
            title: p.title,
            mainTopic: p.main_topic, // Here is the fix!
            docType: p.doc_type,     // Here is the fix!
            structure: p.structure,
            owner_id: p.owner_id
        }));
        
        setProjects(mappedProjects);
      }
    } catch (error) {
      console.error("Failed to load projects", error);
    }
  };

  // --- 2. LOGIN HANDLER ---
  const handleLogin = useCallback(async () => {
    // First, ensure the user exists in the backend (Quick Hack for Demo)
    try {
        await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "demo.user", password: "password" })
        });
    } catch (e) { /* User likely already exists, ignore error */ }

    await fetchProjects(); // Load data
    setAppState(AppState.DASHBOARD);
  }, []);

  const handleLogout = useCallback(() => {
    setAppState(AppState.LOGIN);
    setProjects([]);
  }, []);

  const handleCreateNewProject = useCallback(() => {
    setCurrentProject(null);
    setAppState(AppState.CONFIGURATION);
  }, []);

  const handleSelectProject = useCallback((project: Project) => {
    setCurrentProject(project);
    setAppState(AppState.EDITOR);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setCurrentProject(null);
    fetchProjects(); // Refresh list
    setAppState(AppState.DASHBOARD);
  }, []);

  // --- 3. CREATE PROJECT IN DB ---
  const handleFinishConfiguration = useCallback(async (newProject: Project) => {
    try {
      const payload = {
        title: newProject.title,
        main_topic: newProject.mainTopic, // frontend: mainTopic -> backend: main_topic
        doc_type: newProject.docType,     // frontend: docType   -> backend: doc_type
        structure: newProject.structure
      };

      const res = await fetch(`${API_URL}/projects/${USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const savedProject = await res.json();
        
        // The backend returns snake_case, so we map it back to camelCase for React
        const projectForState: Project = {
            id: savedProject.id,
            title: savedProject.title,
            mainTopic: savedProject.main_topic, // backend: main_topic -> frontend: mainTopic
            docType: savedProject.doc_type,     // backend: doc_type   -> frontend: docType
            structure: savedProject.structure
        };

        setProjects(prev => [...prev, projectForState]);
        setCurrentProject(projectForState);
        setAppState(AppState.EDITOR);
      } else {
        const err = await res.text();
        console.error("Server Error:", err);
        alert("Failed to save project. Check console for details.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  }, []);

  // --- 4. UPDATE PROJECT IN DB ---
  const handleUpdateProject = useCallback(async (updatedProject: Project) => {
    // 1. Update UI immediately so it feels fast
    setCurrentProject(updatedProject);
    setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));

    // 2. Prepare data for Backend (Convert CamelCase to Snake_Case)
    const payload = {
        title: updatedProject.title,
        main_topic: updatedProject.mainTopic, // FIX: mainTopic -> main_topic
        doc_type: updatedProject.docType,     // FIX: docType -> doc_type
        structure: updatedProject.structure
    };

    // 3. Save changes to backend
    try {
        const res = await fetch(`${API_URL}/projects/${updatedProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            console.error("Save failed:", await res.text());
        } else {
            console.log("Auto-saved successfully");
        }
    } catch (error) {
        console.error("Failed to save changes", error);
    }
  }, []);
  
  const handleDeleteProject = useCallback((projectId: string | number) => {
    if (window.confirm('Are you sure? (Note: Delete API not implemented in this step yet)')) {
        // For now, just remove from UI
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    }
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.LOGIN:
        return <LoginScreen onLogin={handleLogin} />;
      case AppState.DASHBOARD:
        return (
          <Dashboard
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateNew={handleCreateNewProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case AppState.CONFIGURATION:
        return (
          <ConfigurationScreen
            onFinishConfiguration={handleFinishConfiguration}
            onBack={handleBackToDashboard}
          />
        );
      case AppState.EDITOR:
        if (currentProject) {
          return (
            <EditorScreen
              project={currentProject}
              onUpdateProject={handleUpdateProject}
              onBack={handleBackToDashboard}
            />
          );
        }
        handleBackToDashboard();
        return null;
      default:
        return <div>Unknown state</div>;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      {appState !== AppState.LOGIN && <Header onLogoClick={handleBackToDashboard} onLogout={handleLogout} />}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;