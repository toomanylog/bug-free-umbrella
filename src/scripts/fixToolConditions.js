/**
 * Script pour corriger les outils avec des conditions sans valeur d'ID
 * 
 * Ce script parcourt tous les outils dans la base de données Firebase
 * et corrige les conditions qui ont une description mais pas de valeur d'ID.
 * 
 * Pour exécuter ce script:
 * 1. Dans le terminal: node src/scripts/fixToolConditions.js
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update } from "firebase/database";
import firebaseConfig from "../firebase/config";

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const fixToolConditions = async () => {
  try {
    console.log("Début de la correction des conditions d'outils...");
    
    // Récupérer tous les outils
    const toolsRef = ref(database, 'tools');
    const toolsSnapshot = await get(toolsRef);
    
    if (!toolsSnapshot.exists()) {
      console.log("Aucun outil trouvé dans la base de données.");
      return;
    }
    
    const toolsData = toolsSnapshot.val();
    console.log(`Nombre d'outils trouvés: ${Object.keys(toolsData).length}`);
    
    // Récupérer toutes les formations
    const formationsRef = ref(database, 'formations');
    const formationsSnapshot = await get(formationsRef);
    const formationsData = formationsSnapshot.exists() ? formationsSnapshot.val() : {};
    
    // Créer un index de formations par titre
    const formationsByTitle = {};
    Object.values(formationsData).forEach(formation => {
      if (formation.title) {
        formationsByTitle[formation.title] = formation.id;
      }
    });
    
    // Récupérer toutes les certifications
    const certificationsRef = ref(database, 'certifications');
    const certificationsSnapshot = await get(certificationsRef);
    const certificationsData = certificationsSnapshot.exists() ? certificationsSnapshot.val() : {};
    
    // Créer un index de certifications par titre
    const certificationsByTitle = {};
    Object.values(certificationsData).forEach(certification => {
      if (certification.title) {
        certificationsByTitle[certification.title] = certification.id;
      }
    });
    
    // Parcourir tous les outils et corriger les conditions
    let updatedCount = 0;
    const updates = {};
    
    for (const [toolId, tool] of Object.entries(toolsData)) {
      let toolUpdated = false;
      
      if (tool.conditions && tool.conditions.length > 0) {
        const updatedConditions = tool.conditions.map(condition => {
          // Si la condition a déjà une valeur, ne rien faire
          if (condition.value) {
            return condition;
          }
          
          // Si la condition a une description mais pas de valeur
          if (condition.description) {
            const updatedCondition = { ...condition };
            
            if (condition.type === 'formation_completed') {
              const formationId = formationsByTitle[condition.description];
              if (formationId) {
                updatedCondition.value = formationId;
                console.log(`Outil ${tool.name}: Formation "${condition.description}" -> ID ${formationId}`);
                toolUpdated = true;
              }
            } else if (condition.type === 'certification_obtained') {
              const certificationId = certificationsByTitle[condition.description];
              if (certificationId) {
                updatedCondition.value = certificationId;
                console.log(`Outil ${tool.name}: Certification "${condition.description}" -> ID ${certificationId}`);
                toolUpdated = true;
              }
            }
            
            return updatedCondition;
          }
          
          return condition;
        });
        
        if (toolUpdated) {
          updates[`tools/${toolId}/conditions`] = updatedConditions;
          updatedCount++;
        }
      }
    }
    
    // Si des mises à jour sont nécessaires, les appliquer
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
      console.log(`${updatedCount} outils ont été mis à jour.`);
    } else {
      console.log("Aucun outil n'a besoin d'être mis à jour.");
    }
    
    console.log("Correction des conditions d'outils terminée.");
  } catch (error) {
    console.error("Erreur lors de la correction des conditions d'outils:", error);
  }
};

// Exécuter le script
fixToolConditions()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 