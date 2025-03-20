import { ref, set, get, push, remove, update } from 'firebase/database';
import { database } from './config';
import { Formation, Module, UserFormationProgress } from './auth';

// Fonction pour obtenir toutes les formations
export const getAllFormations = async (): Promise<Formation[]> => {
  try {
    const formationsRef = ref(database, 'formations');
    const snapshot = await get(formationsRef);
    
    if (snapshot.exists()) {
      const formationsData: Record<string, Formation> = snapshot.val();
      return Object.entries(formationsData).map(([id, formation]) => ({
        ...formation,
        id
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return [];
  }
};

// Fonction pour obtenir les formations publiées uniquement (pour les clients)
export const getPublishedFormations = async (): Promise<Formation[]> => {
  try {
    const formations = await getAllFormations();
    return formations.filter(formation => formation.published);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations publiées:', error);
    return [];
  }
};

// Fonction pour obtenir une formation par son ID
export const getFormationById = async (formationId: string): Promise<Formation | null> => {
  try {
    const formationRef = ref(database, `formations/${formationId}`);
    const snapshot = await get(formationRef);
    
    if (snapshot.exists()) {
      const formationData = snapshot.val();
      return {
        id: formationId,
        ...formationData,
        // Assurez-vous que modules est un tableau et non un objet
        modules: formationData.modules 
          ? Array.isArray(formationData.modules) 
            ? formationData.modules 
            : Object.entries(formationData.modules).map(([id, data]: [string, any]) => ({
                id,
                ...data
              }))
          : []
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error);
    throw error;
  }
};

// Fonction pour créer une nouvelle formation (admin uniquement)
export const createFormation = async (formationData: Omit<Formation, 'id'>): Promise<string> => {
  try {
    const formationsRef = ref(database, 'formations');
    const newFormationRef = push(formationsRef);
    
    await set(newFormationRef, {
      ...formationData,
      createdAt: new Date().toISOString()
    });
    
    return newFormationRef.key || '';
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    throw error;
  }
};

// Fonction pour mettre à jour une formation existante (admin uniquement)
export const updateFormation = async (formationId: string, formationData: Partial<Formation>): Promise<void> => {
  try {
    const formationRef = ref(database, `formations/${formationId}`);
    
    await update(formationRef, {
      ...formationData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la formation ${formationId}:`, error);
    throw error;
  }
};

// Fonction pour supprimer une formation (admin uniquement)
export const deleteFormation = async (formationId: string): Promise<void> => {
  try {
    const formationRef = ref(database, `formations/${formationId}`);
    await remove(formationRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la formation ${formationId}:`, error);
    throw error;
  }
};

// Fonction pour ajouter un module à une formation
export const addModuleToFormation = async (formationId: string, moduleData: Omit<Module, 'id'>): Promise<string> => {
  try {
    const modulesRef = ref(database, `formations/${formationId}/modules`);
    const newModuleRef = push(modulesRef);
    
    await set(newModuleRef, {
      ...moduleData,
      id: newModuleRef.key
    });
    
    return newModuleRef.key || '';
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'un module à la formation ${formationId}:`, error);
    throw error;
  }
};

// Fonction pour mettre à jour un module
export const updateModule = async (formationId: string, moduleId: string, moduleData: Partial<Module>): Promise<void> => {
  try {
    const moduleRef = ref(database, `formations/${formationId}/modules/${moduleId}`);
    await update(moduleRef, moduleData);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du module ${moduleId}:`, error);
    throw error;
  }
};

// Fonction pour supprimer un module
export const deleteModule = async (formationId: string, moduleId: string): Promise<void> => {
  try {
    const moduleRef = ref(database, `formations/${formationId}/modules/${moduleId}`);
    await remove(moduleRef);
  } catch (error) {
    console.error(`Erreur lors de la suppression du module ${moduleId}:`, error);
    throw error;
  }
};

// Fonction pour marquer un module comme complété
export const markModuleAsCompleted = async (userId: string, formationId: string, moduleId: string): Promise<void> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      let formationsProgress = userData.formationsProgress || [];
      
      // Trouver la formation dans les progrès
      const formationIndex = formationsProgress.findIndex(
        (progress: UserFormationProgress) => progress.formationId === formationId
      );
      
      if (formationIndex !== -1) {
        // Formation trouvée, ajouter le module complété s'il n'est pas déjà présent
        if (!formationsProgress[formationIndex].completedModules.includes(moduleId)) {
          formationsProgress[formationIndex].completedModules.push(moduleId);
        }
        
        formationsProgress[formationIndex].lastAccessedAt = new Date().toISOString();
        
        // Vérifier si tous les modules sont complétés
        const formation = await getFormationById(formationId);
        if (formation) {
          const allModules = Object.keys(formation.modules || {});
          const completedModules = formationsProgress[formationIndex].completedModules;
          
          if (allModules.length > 0 && completedModules.length === allModules.length) {
            // Tous les modules sont complétés
            formationsProgress[formationIndex].completed = true;
            formationsProgress[formationIndex].completedAt = new Date().toISOString();
          }
        }
        
        // Mettre à jour les données utilisateur
        await update(userRef, {
          formationsProgress,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error(`Erreur lors du marquage du module ${moduleId} comme complété:`, error);
    throw error;
  }
};

// Fonction pour obtenir les progrès d'un utilisateur sur une formation
export const getUserFormationProgress = async (userId: string, formationId: string): Promise<UserFormationProgress | null> => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      const formationsProgress = userData.formationsProgress || [];
      
      const progress = formationsProgress.find(
        (progress: UserFormationProgress) => progress.formationId === formationId
      );
      
      return progress || null;
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la récupération des progrès pour la formation ${formationId}:`, error);
    return null;
  }
};

// Fonction pour obtenir toutes les formations suivies par un utilisateur
export const getUserFormations = async (userId: string) => {
  console.log('Tentative de récupération des formations pour:', userId);
  try {
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      const formationsProgress = userData.formationsProgress || [];
      
      // Récupérer les détails de chaque formation
      const formationsWithProgress = await Promise.all(
        formationsProgress.map(async (progress: UserFormationProgress) => {
          const formation = await getFormationById(progress.formationId);
          return { formation, progress };
        })
      );
      
      // Filtrer les formations qui n'existent plus
      const filteredFormations = formationsWithProgress.filter(item => item.formation !== null);
      
      console.log('Données utilisateur:', userData);
      console.log('Formations Progress:', formationsProgress);
      console.log('Formations récupérées:', filteredFormations);
      return filteredFormations;
    }
    
    return [];
  } catch (error) {
    console.error('Erreur formations:', error);
    return [];
  }
}; 