/**
 * Script pour corriger les outils avec des conditions sans valeur d'ID
 * 
 * Ce script parcourt tous les outils dans la base de données Firebase
 * et corrige les conditions qui ont une description mais pas de valeur d'ID.
 * 
 * Pour exécuter ce script:
 * 1. Dans le terminal: node src/scripts/fixToolConditions.mjs
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update } from "firebase/database";

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAn-m-jWdS3SYzrdwRbidIJagB2TKpv6yg",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "misalinux-default.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://misalinux-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "misalinux-default",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "misalinux-default.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1074563029787",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1074563029787:web:e74b3ba7987f6dc5a0f41a"
};

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
    
    console.log(`Nombre de formations trouvées: ${Object.keys(formationsData).length}`);
    
    // Créer un index de formations par titre
    const formationsByTitle = {};
    Object.values(formationsData).forEach(formation => {
      if (formation.title) {
        formationsByTitle[formation.title] = formation.id;
      }
    });
    
    console.log("Index des formations par titre:", formationsByTitle);
    
    // Récupérer toutes les certifications
    const certificationsRef = ref(database, 'certifications');
    const certificationsSnapshot = await get(certificationsRef);
    const certificationsData = certificationsSnapshot.exists() ? certificationsSnapshot.val() : {};
    
    console.log(`Nombre de certifications trouvées: ${Object.keys(certificationsData).length}`);
    
    // Créer un index de certifications par titre
    const certificationsByTitle = {};
    Object.values(certificationsData).forEach(certification => {
      if (certification.title) {
        certificationsByTitle[certification.title] = certification.id;
      }
    });
    
    console.log("Index des certifications par titre:", certificationsByTitle);
    
    // Parcourir tous les outils et corriger les conditions
    let updatedCount = 0;
    const updates = {};
    
    for (const [toolId, tool] of Object.entries(toolsData)) {
      let toolUpdated = false;
      
      if (tool.conditions && tool.conditions.length > 0) {
        console.log(`Vérification de l'outil ${tool.name} (${toolId}) avec ${tool.conditions.length} conditions`);
        
        const updatedConditions = tool.conditions.map(condition => {
          console.log("Condition actuelle:", condition);
          
          // Si la condition a déjà une valeur, ne rien faire
          if (condition.value) {
            console.log(`La condition a déjà une valeur: ${condition.value}`);
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
              } else {
                console.log(`Aucune formation trouvée avec le titre "${condition.description}"`);
              }
            } else if (condition.type === 'certification_obtained') {
              const certificationId = certificationsByTitle[condition.description];
              if (certificationId) {
                updatedCondition.value = certificationId;
                console.log(`Outil ${tool.name}: Certification "${condition.description}" -> ID ${certificationId}`);
                toolUpdated = true;
              } else {
                console.log(`Aucune certification trouvée avec le titre "${condition.description}"`);
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
      console.log("Mises à jour à appliquer:", updates);
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
  .then(() => {
    console.log("Script terminé avec succès");
    setTimeout(() => process.exit(0), 1000);
  })
  .catch(error => {
    console.error("Erreur dans le script:", error);
    process.exit(1);
  }); 