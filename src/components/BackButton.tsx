'use client';

import { Button } from "@/components/ui/button";

export default function BackButton() {
  return (
    <Button 
      onClick={() => window.history.back()} 
      variant="link" 
      className="text-[#81B441] hover:text-[#6a9636]"
    >
      Retour au formulaire
    </Button>
  );
} 