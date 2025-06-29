"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Target,
  Clock,
  DollarSign,
  Building,
  Palette,
  Monitor,
  Smartphone,
  AlertCircle,
} from "lucide-react";

interface Brief {
  title: string;
  company: string;
  industry: string;
  description: string;
  objectives: string[];
  target: string;
  constraints?: string[];
  budget: string;
  timeline: string;
  deliverables: string[];
  technicalRequirements?: string[];
  inspirations?: string;
}

const BriefGenerator = () => {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState("website");
  const [selectedComplexity, setSelectedComplexity] = useState("medium");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [error, setError] = useState<string | null>(null);

  const briefTypes = [
    { id: "website", name: "Site Web", icon: Monitor },
    { id: "logo", name: "Logo", icon: Palette },
    { id: "mobile", name: "App Mobile", icon: Smartphone },
    { id: "branding", name: "Branding", icon: Building },
  ];

  const complexityLevels = [
    { id: "simple", name: "Simple", color: "bg-green-100 text-green-800" },
    { id: "medium", name: "Moyen", color: "bg-yellow-100 text-yellow-800" },
    { id: "complex", name: "Complexe", color: "bg-red-100 text-red-800" },
  ];

  const industries = [
    { id: "", name: "Industrie aléatoire" },
    { id: "tech", name: "Tech/SaaS" },
    { id: "ecommerce", name: "E-commerce" },
    { id: "sante", name: "Santé" },
    { id: "finance", name: "Finance" },
    { id: "education", name: "Éducation" },
    { id: "restaurant", name: "Restaurant" },
    { id: "mode", name: "Mode" },
    { id: "immobilier", name: "Immobilier" },
    { id: "sport", name: "Sport" },
    { id: "culture", name: "Art/Culture" },
    { id: "juridique", name: "Juridique" },
    { id: "automobile", name: "Automobile" },
  ];

  const generateBrief = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedType,
          complexity: selectedComplexity,
          industry: selectedIndustry,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du brief");
      }

      const data = await response.json();
      setBrief(data);
    } catch (err) {
      setError("Impossible de générer le brief. Vérifiez votre connexion.");
      console.error("Error generating brief:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTypeData = briefTypes.find((t) => t.id === selectedType);
  const selectedComplexityData = complexityLevels.find(
    (c) => c.id === selectedComplexity
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mt-6 text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Brief Generator AI
          </h1>
          <p className="text-gray-600">
            Générez des briefs créatifs intelligents avec l&apos;IA
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de projet
              </label>
              <div className="grid grid-cols-2 gap-2">
                {briefTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                        selectedType === type.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium text-sm">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complexity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Complexité
              </label>
              <div className="space-y-2">
                {complexityLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedComplexity(level.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedComplexity === level.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${level.color}`}
                    >
                      {level.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Industry Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Industrie
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              >
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={generateBrief}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <RefreshCw
                className={`${isGenerating ? "animate-spin" : ""}`}
                size={20}
              />
              {isGenerating ? "L'IA génère votre brief..." : "Générer"}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Brief Display */}
        {brief && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 animate-fade-in">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {selectedTypeData && (
                    <selectedTypeData.icon
                      className="text-blue-600"
                      size={24}
                    />
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${selectedComplexityData?.color}`}
                  >
                    {selectedComplexityData?.name}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Généré par IA
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {brief.title}
                </h2>
                <p className="text-gray-600">
                  {brief.company} • {brief.industry}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description du projet
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {brief.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Objectifs
                  </h3>
                  <ul className="space-y-2">
                    {brief.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Target
                          className="text-blue-600 mt-1 flex-shrink-0"
                          size={16}
                        />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Cible
                  </h3>
                  <p className="text-gray-700">{brief.target}</p>
                </div>

                {brief.constraints && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Contraintes spécifiques
                    </h3>
                    <ul className="space-y-2">
                      {brief.constraints.map((constraint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="text-green-600" size={20} />
                      <span className="font-medium text-gray-900">Budget</span>
                    </div>
                    <p className="text-gray-700">{brief.budget}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="text-orange-600" size={20} />
                      <span className="font-medium text-gray-900">Délais</span>
                    </div>
                    <p className="text-gray-700">{brief.timeline}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Livrables attendus
                  </h3>
                  <ul className="space-y-2">
                    {brief.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {brief.technicalRequirements && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Exigences techniques
                    </h3>
                    <ul className="space-y-2">
                      {brief.technicalRequirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {brief.inspirations && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Références/Inspirations
                    </h3>
                    <p className="text-gray-700 italic">{brief.inspirations}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={generateBrief}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Générer un nouveau brief
              </button>
              <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Sauvegarder
              </button>
              <button className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors">
                Partager
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Propulsé par Vercel AI SDK + Google AI • Créé pour les créatifs</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BriefGenerator;
