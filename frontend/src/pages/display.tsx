'use client';

import React, { useEffect, useState } from "react";

interface DisplayProps {
  conversationId: string;
}

interface WorkflowData {
  title: string;
  description: string;
  usage: string;
  usageContext: string;
  promptBlockSteps: Array<{
    title: string;
    description: string;
    instructions: string;
    examples: string;
  }>;
}

const Display: React.FC<DisplayProps> = ({ conversationId }) => {
  const [data, setData] = useState<WorkflowData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // When conversationId is available, fetch the related workflow data.
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:6970/flows/${conversationId}`);
        if (!response.ok) throw new Error("Network response was not ok");
        const workflowData: WorkflowData = await response.json();
        setData(workflowData);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message || "An error occurred while fetching data.");
      }
    };

    if (conversationId) {
      fetchData();
    }
  }, [conversationId]);

  if (error) return <p className="text-center text-red-600">{error}</p>;

  if (!data)
    return <p className="text-center text-gray-600">Loading training framework result...</p>;

  return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
        <div className="max-w-3xl mx-auto pt-20 p-6">
          <div className="flex justify-center mb-4">
          <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-semibold">
            Training Framework Result
          </span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-center mb-4">
            {data.title}
          </h2>
          <p className="text-base text-gray-500 mb-6 text-center">{data.description}</p>

          <div className="space-y-6">
            {data.promptBlockSteps.map((step, i) => (
                <div key={i} className="p-4 border rounded-md bg-white">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-gray-600 my-2">{step.description}</p>
                  <p className="text-sm text-gray-500">
                    <strong>Instructions: </strong>
                    {step.instructions}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Example: </strong>
                    {step.examples}
                  </p>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
};

export default Display;