
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ElevenLabsConversation } from './ElevenLabsConversation';

const Stepper = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome",
      content: (
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">Welcome</h2>
          <Button
            onClick={() => setCurrentStep(1)}
            className="rounded-full px-8 py-6 transition-all duration-300 hover:scale-105"
          >
            <span className="mr-2">Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      ),
    },
    {
      title: "Handle Call",
      content: (
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">
            Handle the call normally as our AI patient calls you
          </h2>
          <div className="flex justify-center">
            <ElevenLabsConversation />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {steps[currentStep].content}
      </div>
    </div>
  );
};

export default Stepper;
