import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ElevenLabsConversation } from "./ElevenLabsConversation";
import Display from "@/pages/display.tsx";

const Stepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const handleConversationEnd = (id: string) => {
        setConversationId(id);
        // Optionally, you can advance the step here
        setTimeout(() => {
            setCurrentStep(3);
        }, 5 * 1000);
    };


    const steps = [
    {
      title: "Welcome",
      content: (
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome to ReceptionReplica
          </h2>
          <div className="bg-white p-2.5 rounded-md border border-gray-200">
            <p className="text-base text-gray-500 text-left">
              <b>Missed calls suck.</b>
              <br />
              <br />
              ReceptionReplica is a tool that helps you quickly create a clone
              of yourself and your phone skills.
              <br />
              <br />
              When you click the button below, you will be taken to a screen
              where you can answer a phone call, as if you were getting called
              from a real customer. Then, ReceptionReplica will analyze your
              call and create a training framework based on how you handled the
              conversation.
            </p>
          </div>

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
      title: "Instructions",
      content: (
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">
            Instructions
          </h2>
          <div className="bg-white p-2.5 rounded-md border border-gray-200">
            <p className="text-base text-gray-500 text-left">
              <b>Let's simulate a dental office call.</b>
              <br />
              <br />
              In this example, you'll be acting as a dental office receptionist.
              You'll receive a call from a patient who wants to schedule an
              appointment.
              <br />
              <br />
              Handle the call naturally, just as you would in a real dental
              office. Ask about their needs, check availability, and collect
              necessary information. After the call, ReceptionReplica will
              analyze your conversation and create a personalized training
              framework based on your approach.
            </p>
          </div>

          <Button
            onClick={() => setCurrentStep(2)}
            className="rounded-full px-8 py-6 transition-all duration-300 hover:scale-105"
          >
            <span className="mr-2">Start Call</span>
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
            Show us how you handle a call.
          </h2>
          <div className="flex justify-center">
            <ElevenLabsConversation onConversationEnd={handleConversationEnd}/>
          </div>
        </div>
      ),
    },
      {
      title: "View Flow",
      content: (
        <div className="text-center space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">
            View your training flow.
          </h2>
          {conversationId ? (
            <div className="flex justify-center">
              <Display
              conversationId={conversationId}
              />
            </div>
          ) : (
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-gray-500">
                No conversation data available. Please complete a call first.
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">{steps[currentStep].content}</div>
    </div>
  );
};

export default Stepper;
