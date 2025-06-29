// app/api/generate-brief/route.js
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Schéma pour valider la structure du brief généré
const briefSchema = z.object({
  title: z.string().describe("Titre accrocheur du projet"),
  company: z.string().describe("Nom de l'entreprise fictive"),
  industry: z.string().describe("Secteur d'activité"),
  description: z
    .string()
    .describe("Description détaillée du projet (3-4 phrases)"),
  objectives: z.array(z.string()).describe("Liste de 3-4 objectifs principaux"),
  target: z.string().describe("Description de la cible (2-3 sentences)"),
  budget: z.string().describe("Fourchette budgétaire réaliste"),
  timeline: z.string().describe("Durée du projet"),
  deliverables: z
    .array(z.string())
    .describe("Liste des livrables attendus (4-6 éléments)"),
  constraints: z
    .array(z.string())
    .optional()
    .describe("Contraintes spécifiques optionnelles"),
  technicalRequirements: z
    .array(z.string())
    .optional()
    .describe("Exigences techniques optionnelles"),
  inspirations: z
    .string()
    .optional()
    .describe("Références ou inspirations optionnelles"),
});

// Configuration des budgets et délais selon la complexité
const complexityConfig = {
  simple: {
    budget: { min: 800, max: 5000 },
    timeline: { min: 2, max: 6, unit: "semaines" },
  },
  medium: {
    budget: { min: 5000, max: 20000 },
    timeline: { min: 6, max: 12, unit: "semaines" },
  },
  complex: {
    budget: { min: 20000, max: 100000 },
    timeline: { min: 12, max: 32, unit: "semaines" },
  },
};

const industryTranslations = {
  tech: "Tech/SaaS",
  ecommerce: "E-commerce",
  sante: "Santé",
  finance: "Finance",
  education: "Éducation",
  restaurant: "Restaurant",
  mode: "Mode",
  immobilier: "Immobilier",
  sport: "Sport",
  culture: "Art/Culture",
  juridique: "Juridique",
  automobile: "Automobile",
};

const allowedTypes = ["website", "logo", "mobile", "branding"];
const allowedComplexities = ["simple", "medium", "complex"];

// Configuration des modèles par ordre de préférence
const AI_MODELS = [
  {
    model: google("gemini-1.5-flash"),
    name: "Gemini Flash",
    maxRetries: 2,
  },
  {
    model: google("gemini-1.5-pro"),
    name: "Gemini Pro",
    maxRetries: 1,
  },
];

// Fonction pour attendre avec backoff exponentiel
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fonction pour calculer le délai de retry
function getRetryDelay(attempt, baseDelay = 1000) {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30s
}

function createPrompt(type, complexity, industry) {
  console.log("🔧 Création du prompt pour:", { type, complexity, industry });

  // Validation stricte des paramètres
  if (!type || typeof type !== "string") {
    throw new Error("Le paramètre 'type' est requis et doit être une string");
  }

  if (!complexity || typeof complexity !== "string") {
    throw new Error(
      "Le paramètre 'complexity' est requis et doit être une string"
    );
  }

  if (!allowedTypes.includes(type)) {
    throw new Error(`Type "${type}" non autorisé`);
  }

  if (!allowedComplexities.includes(complexity)) {
    throw new Error(`Complexité "${complexity}" non autorisée`);
  }

  const config = complexityConfig[complexity];
  if (!config || !config.budget || !config.timeline) {
    throw new Error(
      `Configuration invalide pour la complexité "${complexity}"`
    );
  }

  const industryName =
    industry && industryTranslations[industry]
      ? industryTranslations[industry]
      : "secteur varié";

  // Construction du prompt par parties pour éviter les erreurs de template
  const contextPart = [
    `Génère un brief créatif réaliste et détaillé pour un projet de ${type} de niveau ${complexity}.`,
    "",
    "CONTEXTE:",
    `- Type de projet: ${type}`,
    `- Niveau de complexité: ${complexity}`,
    `- Industrie: ${industryName}`,
    `- Budget approximatif: ${config.budget.min}€ - ${config.budget.max}€`,
    `- Durée approximative: ${config.timeline.min}-${config.timeline.max} ${config.timeline.unit}`,
    "",
    "INSTRUCTIONS:",
    "1. Crée un nom d'entreprise fictive crédible",
    "2. Invente un contexte réaliste et engageant",
    "3. Définis des objectifs clairs et mesurables",
    "4. Adapte la complexité aux spécifications:",
    "   - Simple: Projets basiques, fonctionnalités essentielles",
    "   - Moyen: Projets avec intégrations, fonctionnalités avancées",
    "   - Complexe: Projets avec architecture complexe, multiples intégrations",
  ].join("\n");

  // Spécificités selon le type
  const specificParts = {
    website: [
      "",
      "SPÉCIFICITÉS SITE WEB:",
      "- Précise le type (vitrine, e-commerce, SaaS, etc.)",
      "- Mentionne les technologies préférées si pertinent",
      "- Inclus des aspects UX/UI spécifiques",
    ].join("\n"),

    logo: [
      "",
      "SPÉCIFICITÉS LOGO:",
      "- Décris l'univers visuel souhaité",
      "- Mentionne les supports d'application",
      "- Précise les valeurs à véhiculer",
    ].join("\n"),

    mobile: [
      "",
      "SPÉCIFICITÉS APP MOBILE:",
      "- Précise iOS/Android ou les deux",
      "- Mentionne les fonctionnalités clés",
      "- Inclus les aspects techniques (API, base de données, etc.)",
    ].join("\n"),

    branding: [
      "",
      "SPÉCIFICITÉS BRANDING:",
      "- Couvre l'identité complète",
      "- Mentionne tous les supports (print, digital, signalétique)",
      "- Inclus la stratégie de marque",
    ].join("\n"),
  };

  const specificInstructions =
    specificParts[type] ||
    [
      "",
      "SPÉCIFICITÉS GÉNÉRALES:",
      "- Adapte le brief au type de projet demandé",
      "- Sois créatif et réaliste dans les propositions",
    ].join("\n");

  const conclusion =
    "\n\nAssure-toi que le brief soit inspirant et donne envie de travailler dessus !";

  const fullPrompt = contextPart + specificInstructions + conclusion;

  console.log("✅ Prompt créé avec succès, longueur:", fullPrompt.length);
  return fullPrompt;
}

// Fonction principale pour générer avec fallback et retry
async function generateBriefWithFallback(prompt, schema) {
  let lastError;

  // Essayer chaque modèle dans l'ordre
  for (const { model, name, maxRetries } of AI_MODELS) {
    console.log(`🤖 Tentative avec ${name}...`);

    // Retry pour chaque modèle
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Timeout protection pour Vercel
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Timeout: Génération trop longue")),
            8000
          ); // 8s max
        });

        const generatePromise = generateObject({
          model,
          prompt,
          schema,
          temperature: 0.8,
          maxTokens: 2000, // Limite pour éviter les timeouts
        });

        const result = await Promise.race([generatePromise, timeoutPromise]);

        console.log(`✅ Succès avec ${name} (tentative ${attempt + 1})`);
        return result;
      } catch (error) {
        lastError = error;
        console.error(
          `❌ Erreur avec ${name} (tentative ${attempt + 1}):`,
          error.message
        );

        // Gestion spécifique des erreurs 429
        if (error.statusCode === 429) {
          if (attempt < maxRetries) {
            const delay = getRetryDelay(attempt);
            console.log(`⏳ Attente de ${delay}ms avant retry...`);
            await sleep(delay);
            continue;
          }
          // Si c'est le dernier retry pour ce modèle, on passe au suivant
          console.log(
            `🔄 Passage au modèle suivant après épuisement des retries pour ${name}`
          );
          break;
        }

        // Pour les autres erreurs, on ne retry pas
        if (error.statusCode !== 429) {
          console.log(`🔄 Erreur non-429, passage au modèle suivant`);
          break;
        }
      }
    }
  }

  // Si tous les modèles ont échoué
  throw lastError;
}

export async function POST(request) {
  console.log("🚀 Début de la requête POST /api/generate-brief");

  // Debug production
  console.log("🔧 Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    hasGoogleKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    keyLength: process.env.GOOGLE_GENERATIVE_AI_API_KEY?.length || 0,
  });

  try {
    // 1. Parsing des données
    console.log("📥 Parsing du JSON...");
    let body;

    try {
      const text = await request.text();
      console.log("📝 Données brutes reçues:", text);
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ Erreur parsing JSON:", parseError);
      return new Response(
        JSON.stringify({
          error: "Format JSON invalide",
          details: parseError.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("📊 Données parsées:", body);

    // 2. Extraction et validation des paramètres
    const type = body?.type;
    const complexity = body?.complexity;
    const industry = body?.industry;

    if (!type || !complexity) {
      console.error("❌ Paramètres manquants:", { type, complexity });
      return new Response(
        JSON.stringify({
          error: "Les paramètres 'type' et 'complexity' sont requis",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Validation des valeurs
    if (!allowedTypes.includes(type)) {
      console.error("❌ Type non autorisé:", type);
      return new Response(
        JSON.stringify({
          error: `Type "${type}" non autorisé. Types valides: ${allowedTypes.join(
            ", "
          )}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!allowedComplexities.includes(complexity)) {
      console.error("❌ Complexité non autorisée:", complexity);
      return new Response(
        JSON.stringify({
          error: `Complexité "${complexity}" non autorisée. Complexités valides: ${allowedComplexities.join(
            ", "
          )}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Paramètres validés:", { type, complexity, industry });

    // 4. Création du prompt
    console.log("🔧 Création du prompt...");
    let prompt;

    try {
      prompt = createPrompt(type, complexity, industry);
    } catch (promptError) {
      console.error("❌ Erreur création prompt:", promptError);
      return new Response(
        JSON.stringify({
          error: "Erreur lors de la création du prompt",
          details: promptError.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5. Génération avec l'IA (avec fallback et retry)
    console.log("🤖 Génération du brief avec fallback...");
    let result;

    try {
      result = await generateBriefWithFallback(prompt, briefSchema);
      console.log("✅ Brief généré avec succès");
    } catch (aiError) {
      console.error("❌ Erreur IA après tous les fallbacks:", aiError);

      let errorMessage = "Erreur lors de la génération du brief";
      let statusCode = 500;
      let retryAfter = null;

      if (aiError?.message) {
        const message = aiError.message.toLowerCase();

        if (message.includes("api key") || message.includes("authentication")) {
          errorMessage = "Clé API Google manquante ou invalide";
          statusCode = 401;
        } else if (
          message.includes("quota") ||
          message.includes("limit") ||
          aiError.statusCode === 429
        ) {
          errorMessage =
            "Tous les quotas API sont temporairement épuisés. Réessayez dans quelques minutes.";
          statusCode = 429;
          retryAfter = 300; // 5 minutes
        } else if (message.includes("timeout")) {
          errorMessage = "Timeout lors de la génération, réessayez";
          statusCode = 408;
        } else if (message.includes("model")) {
          errorMessage = "Modèles IA temporairement indisponibles";
          statusCode = 503;
        }
      }

      const errorResponse = {
        error: errorMessage,
        retryAfter,
        details:
          process.env.NODE_ENV === "development" ? aiError?.message : undefined,
      };

      const headers = {
        "Content-Type": "application/json",
        ...(retryAfter && { "Retry-After": retryAfter.toString() }),
      };

      return new Response(JSON.stringify(errorResponse), {
        status: statusCode,
        headers,
      });
    }

    // 6. Validation du résultat
    if (!result || !result.object) {
      console.error("❌ Résultat IA invalide:", result);
      return new Response(
        JSON.stringify({
          error: "Résultat de génération invalide ou vide",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 7. Validation avec le schéma
    try {
      const validatedObject = briefSchema.parse(result.object);
      console.log("✅ Brief validé et prêt");

      return new Response(JSON.stringify(validatedObject), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (validationError) {
      console.error("❌ Erreur validation schéma:", validationError);
      return new Response(
        JSON.stringify({
          error: "Le brief généré ne respecte pas le format attendu",
          details:
            process.env.NODE_ENV === "development"
              ? validationError.message
              : undefined,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("❌ Erreur générale non gérée:", error);
    console.error("Stack trace:", error.stack);

    return new Response(
      JSON.stringify({
        error: "Erreur interne du serveur",
        details:
          process.env.NODE_ENV === "development"
            ? {
                message: error.message,
                stack: error.stack,
              }
            : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Gestion des autres méthodes HTTP
export async function GET() {
  return new Response(
    JSON.stringify({
      error: "Méthode GET non autorisée",
      allowedMethods: ["POST"],
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
}
