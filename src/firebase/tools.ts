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
    console.log(`[checkToolAccess] Vérification d'accès pour l'utilisateur ${userId} à l'outil ${toolId}`);
    
    // Récupérer l'outil
    const toolRef = ref(database, `tools/${toolId}`);
    const toolSnapshot = await get(toolRef);
    
    if (!toolSnapshot.exists()) {
      console.error(`[checkToolAccess] L'outil ${toolId} n'existe pas`);
      throw new Error(`L'outil ${toolId} n'existe pas`);
    }
    
    const tool = toolSnapshot.val() as Tool;
    console.log(`[checkToolAccess] Outil récupéré: ${tool.name} (${toolId})`, JSON.stringify(tool, null, 2));
    
    // Vérifier si l'outil est actif
    if (tool.status !== ToolStatus.ACTIVE) {
      console.log(`[checkToolAccess] L'outil ${tool.name} n'est pas actif (statut: ${tool.status})`);
      return {
        hasAccess: false,
        missingConditions: ['Cet outil n\'est pas encore disponible']
      };
    }
    
    // Si pas de conditions, accès autorisé
    if (!tool.conditions || tool.conditions.length === 0) {
      console.log(`[checkToolAccess] Aucune condition requise pour l'outil ${tool.name}, accès autorisé`);
      return {
        hasAccess: true,
        missingConditions: []
      };
    }
    
    // Récupérer les données utilisateur
    console.log(`[checkToolAccess] Récupération des données pour l'utilisateur ${userId}`);
    const userData = await getUserData(userId);
    console.log(`[checkToolAccess] Données utilisateur récupérées:`, userData ? "OK" : "NULL");
    
    if (userData) {
      console.log(`[checkToolAccess] Données détaillées de l'utilisateur:`, JSON.stringify({
        formationsProgress: userData.formationsProgress || "non défini",
        certifications: userData.certifications || "non défini",
        toolPermissions: userData.toolPermissions || "non défini",
        isAdmin: userData.isAdmin || false
      }, null, 2));
    }
    
    if (!userData) {
      console.error(`[checkToolAccess] Impossible de récupérer les données pour l'utilisateur ${userId}`);
      return {
        hasAccess: false,
        missingConditions: ['Impossible de récupérer vos données utilisateur']
      };
    }
    
    const missingConditions: string[] = [];
    
    // Vérifier chaque condition
    console.log(`[checkToolAccess] Vérification de ${tool.conditions.length} conditions pour l'outil ${tool.name}`);
    
    for (const condition of tool.conditions) {
      console.log(`[checkToolAccess] Vérification de la condition:`, JSON.stringify(condition, null, 2));
      
      switch (condition.type) {
        case ConditionType.FORMATION_COMPLETED: {
          let formationId = condition.value;
          
          // Si l'ID est manquant mais qu'on a une description, essayer de trouver la formation par son titre
          if (!formationId && condition.description) {
            console.log(`[checkToolAccess] ID de formation manquant, recherche par description: "${condition.description}"`);
            try {
              const formationsRef = ref(database, 'formations');
              const formationsSnapshot = await get(formationsRef);
              
              if (formationsSnapshot.exists()) {
                const formationsData = formationsSnapshot.val();
                const matchingFormation = Object.values(formationsData).find(
                  (f: any) => f.title === condition.description
                );
                
                if (matchingFormation) {
                  formationId = (matchingFormation as any).id;
                  console.log(`[checkToolAccess] Formation trouvée par titre: ${formationId}`);
                }
              }
            } catch (error) {
              console.error(`[checkToolAccess] Erreur lors de la recherche de formation par titre:`, error);
            }
          }
          
          if (!formationId) {
            console.log(`[checkToolAccess] Aucun ID de formation valide trouvé, condition non satisfaite`);
            missingConditions.push(`Terminer la formation "${condition.description || 'requise'}"`);
            break;
          }
          
          console.log(`[checkToolAccess] Recherche de la formation ${formationId} dans les formations de l'utilisateur`);
          
          console.log(`[checkToolAccess] Type de formationsProgress:`, userData.formationsProgress ? 
            (Array.isArray(userData.formationsProgress) ? "tableau" : "objet") : "non défini");
          
          // Vérifier si formationsProgress est un objet ou un tableau
          let formationProgress;
          if (Array.isArray(userData.formationsProgress)) {
            console.log(`[checkToolAccess] formationsProgress (tableau):`, JSON.stringify(userData.formationsProgress, null, 2));
            formationProgress = userData.formationsProgress.find(
              (p: any) => p.formationId === formationId && p.completed
            );
          } else if (userData.formationsProgress) {
            // Si c'est un objet avec des clés
            console.log(`[checkToolAccess] formationsProgress (objet):`, JSON.stringify(userData.formationsProgress, null, 2));
            formationProgress = Object.values(userData.formationsProgress).find(
              (p: any) => p.formationId === formationId && p.completed
            );
          } else {
            console.log(`[checkToolAccess] Aucune donnée de progression de formation trouvée pour l'utilisateur`);
          }
          
          console.log(`[checkToolAccess] Formation trouvée:`, formationProgress ? JSON.stringify(formationProgress, null, 2) : "non trouvée");
          
          if (!formationProgress) {
            // Récupérer le titre de la formation pour un message plus précis
            try {
              console.log(`[checkToolAccess] Tentative de récupération des détails de la formation ${formationId}`);
              const formationRef = ref(database, `formations/${formationId}`);
              const formationSnapshot = await get(formationRef);
              
              console.log(`[checkToolAccess] Données de la formation ${formationId}:`, 
                formationSnapshot.exists() ? "trouvée" : "non trouvée");
              
              let formationTitle = condition.description || 'requise';
              if (formationSnapshot.exists()) {
                const formationData = formationSnapshot.val();
                console.log(`[checkToolAccess] Détails de la formation:`, JSON.stringify(formationData, null, 2));
                formationTitle = formationData.title || formationTitle;
                console.log(`[checkToolAccess] Titre de la formation: "${formationTitle}"`);
              } else {
                console.log(`[checkToolAccess] Formation ${formationId} non trouvée dans la base de données`);
              }
              
              missingConditions.push(`Terminer la formation "${formationTitle}"`);
            } catch (error) {
              console.error(`[checkToolAccess] Erreur lors de la récupération de la formation ${formationId}:`, error);
              missingConditions.push(`Terminer la formation "${condition.description || 'requise'}"`);
            }
          }
          break;
        }
          
        case ConditionType.CERTIFICATION_OBTAINED: {
          let certificationId = condition.value;
          
          // Si l'ID est manquant mais qu'on a une description, essayer de trouver la certification par son titre
          if (!certificationId && condition.description) {
            console.log(`[checkToolAccess] ID de certification manquant, recherche par description: "${condition.description}"`);
            try {
              const certificationsRef = ref(database, 'certifications');
              const certificationsSnapshot = await get(certificationsRef);
              
              if (certificationsSnapshot.exists()) {
                const certificationsData = certificationsSnapshot.val();
                const matchingCertification = Object.values(certificationsData).find(
                  (c: any) => c.title === condition.description
                );
                
                if (matchingCertification) {
                  certificationId = (matchingCertification as any).id;
                  console.log(`[checkToolAccess] Certification trouvée par titre: ${certificationId}`);
                }
              }
            } catch (error) {
              console.error(`[checkToolAccess] Erreur lors de la recherche de certification par titre:`, error);
            }
          }
          
          if (!certificationId) {
            console.log(`[checkToolAccess] Aucun ID de certification valide trouvé, condition non satisfaite`);
            missingConditions.push(`Obtenir la certification "${condition.description || 'requise'}"`);
            break;
          }
          
          console.log(`[checkToolAccess] Recherche de la certification ${certificationId} pour l'utilisateur`);
          
          console.log(`[checkToolAccess] Type de certifications:`, userData.certifications ? 
            (Array.isArray(userData.certifications) ? "tableau" : "objet") : "non défini");
          
          // Vérifier les différentes structures possibles de certifications
          let hasCertification = false;
          
          if (userData.certifications) {
            if (Array.isArray(userData.certifications)) {
              console.log(`[checkToolAccess] certifications (tableau):`, JSON.stringify(userData.certifications, null, 2));
              hasCertification = userData.certifications.some((c: any) => {
                const result = (typeof c === 'string' && c === certificationId) || 
                  (typeof c === 'object' && c.id === certificationId);
                console.log(`[checkToolAccess] Vérification de la certification ${JSON.stringify(c)}: ${result}`);
                return result;
              });
            } else {
              // Si c'est un objet avec des clés
              console.log(`[checkToolAccess] certifications (objet):`, JSON.stringify(userData.certifications, null, 2));
              hasCertification = userData.certifications[certificationId] !== undefined;
              console.log(`[checkToolAccess] Certification ${certificationId} dans l'objet: ${hasCertification}`);
            }
          } else {
            console.log(`[checkToolAccess] Aucune donnée de certification trouvée pour l'utilisateur`);
          }
          
          // Vérifier aussi dans formationsProgress si les certifications y sont stockées
          if (!hasCertification && userData.formationsProgress) {
            console.log(`[checkToolAccess] Recherche de la certification dans formationsProgress`);
            if (Array.isArray(userData.formationsProgress)) {
              hasCertification = userData.formationsProgress.some((p: any) => {
                const result = p.certificateId === certificationId || p.certificationId === certificationId;
                console.log(`[checkToolAccess] Vérification dans formationsProgress (certificateId/certificationId): ${result}`);
                return result;
              });
            } else {
              hasCertification = Object.values(userData.formationsProgress).some((p: any) => {
                const result = p.certificateId === certificationId || p.certificationId === certificationId;
                console.log(`[checkToolAccess] Vérification dans formationsProgress (certificateId/certificationId): ${result}`);
                return result;
              });
            }
          }
          
          console.log(`[checkToolAccess] Certification trouvée: ${hasCertification}`);
          
          if (!hasCertification) {
            // Récupérer le titre de la certification
            try {
              console.log(`[checkToolAccess] Tentative de récupération des détails de la certification ${certificationId}`);
              const certificationRef = ref(database, `certifications/${certificationId}`);
              const certificationSnapshot = await get(certificationRef);
              
              console.log(`[checkToolAccess] Données de la certification ${certificationId}:`, 
                certificationSnapshot.exists() ? "trouvée" : "non trouvée");
              
              let certificationTitle = condition.description || 'requise';
              if (certificationSnapshot.exists()) {
                const certificationData = certificationSnapshot.val();
                console.log(`[checkToolAccess] Détails de la certification:`, JSON.stringify(certificationData, null, 2));
                certificationTitle = certificationData.title || certificationTitle;
                console.log(`[checkToolAccess] Titre de la certification: "${certificationTitle}"`);
              } else {
                console.log(`[checkToolAccess] Certification ${certificationId} non trouvée dans la base de données`);
              }
              
              missingConditions.push(`Obtenir la certification "${certificationTitle}"`);
            } catch (error) {
              console.error(`[checkToolAccess] Erreur lors de la récupération de la certification ${certificationId}:`, error);
              missingConditions.push(`Obtenir la certification "${condition.description || 'requise'}"`);
            }
          }
          break;
        }
          
        case ConditionType.ADMIN_ASSIGNED:
          // Vérifier si l'utilisateur a une autorisation spéciale
          console.log(`[checkToolAccess] Vérification des permissions administrateur pour l'outil ${toolId}`);
          
          console.log(`[checkToolAccess] Type de toolPermissions:`, userData.toolPermissions ? 
            (Array.isArray(userData.toolPermissions) ? "tableau" : "objet") : "non défini");
          
          if (userData.toolPermissions) {
            console.log(`[checkToolAccess] toolPermissions:`, JSON.stringify(userData.toolPermissions, null, 2));
          }
          
          const toolPermissions = userData.toolPermissions || {};
          if (!toolPermissions[toolId]) {
            console.log(`[checkToolAccess] Aucune permission trouvée pour l'outil ${toolId}`);
            missingConditions.push(condition.description || 'Obtenir une autorisation d\'accès de l\'administrateur');
          } else {
            console.log(`[checkToolAccess] Permission trouvée pour l'outil ${toolId}:`, JSON.stringify(toolPermissions[toolId], null, 2));
          }
          break;
      }
    }
    
    console.log(`[checkToolAccess] Conditions manquantes (${missingConditions.length}):`, JSON.stringify(missingConditions, null, 2));
    
    return {
      hasAccess: missingConditions.length === 0,
      missingConditions
    };
  } catch (error) {
    console.error(`[checkToolAccess] Erreur lors de la vérification d'accès à l'outil ${toolId}:`, error);
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