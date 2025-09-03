import { atom } from 'jotai';
import type { ProjectWithUser } from '@cartel-sh/api';

export interface ProjectSettings {
  // Map of project ID to visibility (true = visible, false = hidden)
  visibility: Record<string, boolean>;
  // Array of project IDs in preferred order
  order: string[];
  // Last updated timestamp
  lastUpdated: number;
}

// Default settings
const defaultSettings: ProjectSettings = {
  visibility: {},
  order: [],
  lastUpdated: Date.now(),
};

// Custom localStorage implementation for project settings
const STORAGE_KEY = 'cartel-project-settings';

// Helper functions for localStorage
const getStoredSettings = (): ProjectSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        visibility: parsed.visibility || {},
        order: parsed.order || [],
        lastUpdated: parsed.lastUpdated || Date.now(),
      };
    }
  } catch (error) {
    console.warn('Failed to load project settings from localStorage:', error);
  }
  
  return defaultSettings;
};

const saveSettings = (settings: ProjectSettings) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save project settings to localStorage:', error);
  }
};

// Atom with localStorage persistence
export const projectSettingsAtom = atom<ProjectSettings>(getStoredSettings());

// Write-only atom for updating settings with localStorage persistence  
export const writeProjectSettingsAtom = atom(
  null,
  (get, set, newValue: ProjectSettings) => {
    set(projectSettingsAtom, newValue);
    saveSettings(newValue);
  }
);

// Derived atom to get visibility setting for a specific project
export const getProjectVisibilityAtom = atom(
  (get) => (projectId: string): boolean => {
    const settings = get(projectSettingsAtom);
    // Default to visible if not explicitly set
    return settings.visibility[projectId] ?? true;
  }
);

// Atom to toggle project visibility
export const toggleProjectVisibilityAtom = atom(
  null,
  (get, set, projectId: string) => {
    const currentSettings = get(projectSettingsAtom);
    const currentVisibility = currentSettings.visibility[projectId] ?? true;
    
    const newSettings = {
      ...currentSettings,
      visibility: {
        ...currentSettings.visibility,
        [projectId]: !currentVisibility,
      },
      lastUpdated: Date.now(),
    };
    
    set(writeProjectSettingsAtom, newSettings);
  }
);

// Atom to set project visibility
export const setProjectVisibilityAtom = atom(
  null,
  (get, set, { projectId, visible }: { projectId: string; visible: boolean }) => {
    const currentSettings = get(projectSettingsAtom);
    
    const newSettings = {
      ...currentSettings,
      visibility: {
        ...currentSettings.visibility,
        [projectId]: visible,
      },
      lastUpdated: Date.now(),
    };
    
    set(writeProjectSettingsAtom, newSettings);
  }
);

// Atom to update project order
export const updateProjectOrderAtom = atom(
  null,
  (get, set, newOrder: string[]) => {
    const currentSettings = get(projectSettingsAtom);
    
    const newSettings = {
      ...currentSettings,
      order: newOrder,
      lastUpdated: Date.now(),
    };
    
    set(writeProjectSettingsAtom, newSettings);
  }
);

// Atom to get ordered and filtered projects
export const getOrderedProjectsAtom = atom(
  (get) => (projects: ProjectWithUser[]): ProjectWithUser[] => {
    const settings = get(projectSettingsAtom);
    
    // Filter out hidden projects
    const visibleProjects = projects.filter(project => 
      settings.visibility[project.id] !== false
    );
    
    // Apply custom order if available
    if (settings.order.length > 0) {
      const orderedProjects: ProjectWithUser[] = [];
      const projectMap = new Map(visibleProjects.map(p => [p.id, p]));
      
      // Add projects in the specified order
      for (const projectId of settings.order) {
        const project = projectMap.get(projectId);
        if (project) {
          orderedProjects.push(project);
          projectMap.delete(projectId);
        }
      }
      
      // Add any remaining projects that weren't in the order list
      orderedProjects.push(...Array.from(projectMap.values()));
      
      return orderedProjects;
    }
    
    // Return visible projects in their original order
    return visibleProjects;
  }
);

// Atom to initialize project settings when projects are loaded
export const initializeProjectSettingsAtom = atom(
  null,
  (get, set, projects: ProjectWithUser[]) => {
    const currentSettings = get(projectSettingsAtom);
    let hasChanges = false;
    
    // Initialize visibility for new projects
    const newVisibility = { ...currentSettings.visibility };
    for (const project of projects) {
      if (!(project.id in newVisibility)) {
        newVisibility[project.id] = true; // Default to visible
        hasChanges = true;
      }
    }
    
    // Clean up visibility settings for deleted projects
    const currentProjectIds = new Set(projects.map(p => p.id));
    for (const projectId in currentSettings.visibility) {
      if (!currentProjectIds.has(projectId)) {
        delete newVisibility[projectId];
        hasChanges = true;
      }
    }
    
    // Clean up order array for deleted projects
    const newOrder = currentSettings.order.filter(id => currentProjectIds.has(id));
    if (newOrder.length !== currentSettings.order.length) {
      hasChanges = true;
    }
    
    if (hasChanges) {
      const newSettings = {
        ...currentSettings,
        visibility: newVisibility,
        order: newOrder,
        lastUpdated: Date.now(),
      };
      set(writeProjectSettingsAtom, newSettings);
    }
  }
);

// Atom to get count of hidden projects
export const getHiddenProjectCountAtom = atom(
  (get) => {
    const settings = get(projectSettingsAtom);
    return Object.values(settings.visibility).filter(visible => !visible).length;
  }
);

// Atom to show/hide all projects
export const toggleAllProjectsVisibilityAtom = atom(
  null,
  (get, set, { projects, makeVisible }: { projects: ProjectWithUser[]; makeVisible: boolean }) => {
    const currentSettings = get(projectSettingsAtom);
    const newVisibility = { ...currentSettings.visibility };
    
    for (const project of projects) {
      newVisibility[project.id] = makeVisible;
    }
    
    const newSettings = {
      ...currentSettings,
      visibility: newVisibility,
      lastUpdated: Date.now(),
    };
    
    set(writeProjectSettingsAtom, newSettings);
  }
);