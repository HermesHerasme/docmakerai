import React from "react";

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      {/* 
        Concept: "The Prism Star"
        
        A central 4-pointed star shape, but constructed from 4 geometric facets (kites).
        This gives it a "cut gem" or "precision" look, common in AI tools (like Gemini/Anthropic).
        
        The facets have slight gaps to emphasize the structure.
      */}
      
      {/* Top Facet */}
      <path 
        d="M12 2L14.5 9.5L12 11.5L9.5 9.5L12 2Z" 
        fillOpacity="0.9" 
      />
      
      {/* Right Facet */}
      <path 
        d="M22 12L14.5 14.5L12.5 12L14.5 9.5L22 12Z" 
        fillOpacity="0.6" 
      />
      
      {/* Bottom Facet */}
      <path 
        d="M12 22L9.5 14.5L12 12.5L14.5 14.5L12 22Z" 
        fillOpacity="0.9" 
      />
      
      {/* Left Facet */}
      <path 
        d="M2 12L9.5 9.5L11.5 12L9.5 14.5L2 12Z" 
        fillOpacity="0.6" 
      />

      {/* Center Core - A small diamond to bind them */}
      <path 
        d="M12 10.5L13.5 12L12 13.5L10.5 12L12 10.5Z" 
        fill="currentColor" 
      />
    </svg>
  );
};