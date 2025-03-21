import { ref, set, get, push, remove, update } from 'firebase/database';
import { database } from './config';
import { getUserData } from './auth';

// Types
export interface Tool {
  id: string;
  name: string;
  description: string;
  iconType: 'lucide' | 'custom';
  icon: string;
  status: ToolStatus;
  features: string[];
  downloadLink?: string;
  conditions: ToolCondition[];
  createdAt: string;
  updatedAt?: string;
}

export enum ToolStatus {
  ACTIVE = 'active',
  SOON = 'soon',
  INACTIVE = 'inactive',
  UPDATING = 'updating'
}

export interface ToolCondition {
  type: ConditionType;
  value: string;
  description: string;
}

export enum ConditionType {
  FORMATION_COMPLETED = 'formation_completed',
  CERTIFICATION_OBTAINED = 'certification_obtained',
  ADMIN_ASSIGNED = 'admin_assigned'
}

// Fonction pour récupérer tous les outils
export const getAllTools = async (): Promise<Tool[]> => {
  try {
    const toolsRef = ref(database, 'tools');
    const snapshot = await get(toolsRef);
    
    if (snapshot.exists()) {
      const toolsData = snapshot.val();
      return Object.entries(toolsData).map(([id, data]) => ({
        id,
        ...(data as any)
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des outils:', error);
    return [];
  }
};

// Fonction pour créer un nouvel outil
export const createTool = async (toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const toolsRef = ref(database, 'tools');
    const newToolRef = push(toolsRef);
    
    const timestamp = new Date().toISOString();
    const newTool = {
      ...toolData,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await set(newToolRef, newTool);
    return newToolRef.key || '';
  } catch (error) {
    console.error('Erreur lors de la création de l\'outil:', error);
    throw error;
  }
};

// Fonction pour mettre à jour un outil
export const updateTool = async (toolId: string, toolData: Partial<Tool>): Promise<void> => {
  try {
    const toolRef = ref(database, `tools/${toolId}`);
    
    await update(toolRef, {
      ...toolData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'outil ${toolId}:`, error);
    throw error;
  }
};

// Fonction pour supprimer un outil
export const deleteTool = async (toolId: string): Promise<void> => {
  try {
    const toolRef = ref(database, `tools/${toolId}`);
    await remove(toolRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'outil ${toolId}:`, error);
    throw error;
  }
};

// Fonction pour vérifier si un utilisateur a accès à un outil
export const checkToolAccess = async (userId: string, toolId: string): Promise<{
  hasAccess: boolean;
  missingConditions: string[];
}> => {
  try {
    // Récupérer l'outil
    const toolRef = ref(database, `tools/${toolId}`);
    const toolSnapshot = await get(toolRef);
    
    if (!toolSnapshot.exists()) {
      throw new Error(`L'outil ${toolId} n'existe pas`);
    }
    
    const tool = toolSnapshot.val() as Tool;
    
    // Vérifier si l'outil est actif
    if (tool.status !== ToolStatus.ACTIVE) {
      return {
        hasAccess: false,
        missingConditions: ['Cet outil n\'est pas encore disponible']
      };
    }
    
    // Si pas de conditions, accès autorisé
    if (!tool.conditions || tool.conditions.length === 0) {
      return {
        hasAccess: true,
        missingConditions: []
      };
    }
    
    // Récupérer les données utilisateur
    const userData = await getUserData(userId);
    if (!userData) {
      return {
        hasAccess: false,
        missingConditions: ['Impossible de récupérer vos données utilisateur']
      };
    }
    
    const missingConditions: string[] = [];
    
    // Vérifier chaque condition
    for (const condition of tool.conditions) {
      switch (condition.type) {
        case ConditionType.FORMATION_COMPLETED:
          const formationId = condition.value;
          const formationProgress = userData.formationsProgress?.find(
            (p: any) => p.formationId === formationId && p.completed
          );
          
          if (!formationProgress) {
            // Récupérer le titre de la formation pour un message plus précis
            const formationRef = ref(database, `formations/${formationId}`);
            const formationSnapshot = await get(formationRef);
            const formationTitle = formationSnapshot.exists() 
              ? formationSnapshot.val().title 
              : 'une formation spécifique';
            
            missingConditions.push(`Terminer la formation "${formationTitle}"`);
          }
          break;
          
        case ConditionType.CERTIFICATION_OBTAINED:
          const certificationId = condition.value;
          const hasCertification = userData.certifications && 
                                   userData.certifications[certificationId];
          
          if (!hasCertification) {
            // Récupérer le titre de la certification
            const certificationRef = ref(database, `certifications/${certificationId}`);
            const certificationSnapshot = await get(certificationRef);
            const certificationTitle = certificationSnapshot.exists() 
              ? certificationSnapshot.val().title || 'non spécifiée'
              : 'non spécifiée';
            
            missingConditions.push(`Obtenir la certification "${certificationTitle}"`);
          }
          break;
          
        case ConditionType.ADMIN_ASSIGNED:
          // Vérifier si l'utilisateur a une autorisation spéciale
          const toolPermissions = userData.toolPermissions || {};
          if (!toolPermissions[toolId]) {
            missingConditions.push('Obtenir une autorisation d\'accès de l\'administrateur');
          }
          break;
      }
    }
    
    return {
      hasAccess: missingConditions.length === 0,
      missingConditions
    };
  } catch (error) {
    console.error(`Erreur lors de la vérification d'accès à l'outil ${toolId}:`, error);
    return {
      hasAccess: false,
      missingConditions: ['Une erreur est survenue lors de la vérification de l\'accès']
    };
  }
};

// Fonction pour accorder un accès spécial à un outil (admin seulement)
export const grantToolAccess = async (userId: string, toolId: string): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userId}/toolPermissions/${toolId}`);
    await set(userRef, {
      grantedAt: new Date().toISOString(),
      grantedBy: 'admin' // Idéalement, on stockerait ici l'ID de l'admin qui accorde la permission
    });
  } catch (error) {
    console.error(`Erreur lors de l'attribution d'accès à l'outil ${toolId}:`, error);
    throw error;
  }
};

// Fonction pour révoquer un accès spécial (admin seulement)
export const revokeToolAccess = async (userId: string, toolId: string): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userId}/toolPermissions/${toolId}`);
    await remove(userRef);
  } catch (error) {
    console.error(`Erreur lors de la révocation d'accès à l'outil ${toolId}:`, error);
    throw error;
  }
}; 