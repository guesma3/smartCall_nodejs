function extractJsonFromNoise(str) {
  if (typeof str !== 'string') return null;

  // 1. NETTOYAGE : Supprime tous les caractères spéciaux / non imprimables
  // On garde : lettres (a-z, A-Z), chiffres (0-9), espaces, et les symboles JSON { } [ ] : , " . - _
  // \u0000-\u001F : Codes de contrôle (0-31)
  // \u007F-\u009F : Codes de contrôle étendus
  // \u0080-\uFFFF : Caractères Unicode spéciaux indésirables (si votre JSON est purement ASCII)
  
  // Option A (La plus stricte pour du JSON technique) : On garde uniquement l'ASCII imprimé et les symboles JSON
  const cleanStr = str.replace(/[^\x20-\x7E{}[\]:,".\-_0-9a-zA-Z]/g, '');

  // Si après nettoyage la chaîne est vide
  if (!cleanStr.trim()) return null;

  const startIdx = cleanStr.indexOf('{');
  const endIdx = cleanStr.lastIndexOf('}');

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  const potentialJson = cleanStr.substring(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(potentialJson);

    if (parsed && (typeof parsed === 'object' || Array.isArray(parsed))) {
      return parsed;
    }
    return null;
  } catch (error) {
    // Optionnel : console.log("Erreur parse:", error.message);
    return null;
  }
}


function stripSpecialChars(str) {
  if (typeof str !== 'string') return '';
  
  // [^{}":,0-9a-zA-Z] signifie : tout ce qui N'EST PAS dans cette liste est supprimé
  return str.replace(/[^{}":,0-9a-zA-Z]/g, '');
}

// --- Utilisation dans votre boucle ---

// Simulation d'une ligne avec des caractères spéciaux (ex: bits de parité, null bytes, etc.)
// \x00 est un caractère nul, \x1A est un caractère de contrôle
let lineRaw = "\x00\x1A s%{\"s\" : 7, %\"e\":15}% ghj\x00\xFF"; 
lineRaw = stripSpecialChars(lineRaw) ;
const cleanData = extractJsonFromNoise(lineRaw);

if (!cleanData) {
  console.warn('Aucun JSON valide extrait de:', lineRaw);
  // return; // Décommentez si vous êtes dans une fonction async
} else {
  console.log('JSON Extrait et Propre:', cleanData);
  var trame = cleanData;
  // trame sera : { s: 7, e: 15 }
}
