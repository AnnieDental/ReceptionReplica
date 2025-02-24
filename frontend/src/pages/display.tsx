import React from "react";

const dentalCleaningWorkflow = {
  title: "Dental Cleaning Appointment Scheduling Workflow",
  description:
    "This workflow outlines the steps taken by the dental office to schedule dental cleaning appointments for patients. The process includes greeting the patient, verifying contact details, asking for appointment preferences, checking schedule availability, confirming the appointments, and closing the call.",
  usage:
    "This workflow should be used as a guideline for dental office staff when handling appointment scheduling calls. It ensures that all necessary steps are followed in proper order.",
  usageContext:
    "Applicable when a patient calls to book one or more dental appointments, particularly for dental cleaning procedures.",
  promptBlockSteps: [
    {
      title: "Greeting and Contact Info Request",
      description:
        "Greet the caller and request their phone number to begin the scheduling process.",
      instructions:
        "Greet the patient by name if available and ask for the contact number to verify identity and follow up if needed.",
      examples:
        "Example: 'Hello, Sarah! We'd be happy to help. Could you please provide your phone number?'",
    },
    {
      title: "Confirm Personal Details",
      description:
        "Verify the caller's identity by confirming personal details.",
      instructions:
        "Thank the caller for providing the phone number and ask for confirmation of their full name to ensure records are accurate.",
      examples:
        "Example: 'Great, thank you. And just to confirm, your full name is Sarah Carter, correct?'",
    },
    {
      title: "Ask for Appointment Preferences",
      description:
        "Inquire about the preferred days and times for the appointment.",
      instructions:
        "Ask the caller to specify which days and times work best for them to schedule the appointments.",
      examples:
        "Example: 'Perfect. Now, could you let us know which days and times work best for you?'",
    },
    {
      title: "Check Appointment Availability",
      description:
        "Review the schedule to verify available appointment slots matching the caller's preferences.",
      instructions:
        "Check the office's calendar to find openings that correspond to the days and times mentioned by the patient. Confirm these available slots with the patient.",
      examples:
        "Example: 'Let me check our schedule… Yes, we have an opening at 10:00 AM on Tuesday and a 2:30 PM slot on Wednesday.'",
    },
    {
      title: "Schedule and Confirm Appointment",
      description:
        "Finalize the scheduling by booking the appointments and confirming the details with the patient.",
      instructions:
        "Schedule the dental cleaning appointments for the children based on the agreed time slots. Confirm the appointment details and ask if any further assistance is required.",
      examples:
        "Example: 'Excellent! I've scheduled a cleaning for your first child on Tuesday at 10:00 AM and for your second child on Wednesday at 2:30 PM. Is there anything else you need?'",
    },
    {
      title: "Close Call",
      description: "Conclude the call with courteous closing remarks.",
      instructions:
        "Thank the patient, express eagerness for the upcoming visit, and provide closing remarks to end the call pleasantly.",
      examples:
        "Example: 'You're welcome, Sarah. We look forward to seeing you and your kids soon. Have a great day!'",
    },
  ],
};

const Display = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary">
      <div className="max-w-3xl mx-auto pt-20 p-6">
        <div className="flex justify-center mb-4">
          <span className="bg-primary/20 text-primary px-4 py-1 rounded-full text-sm font-semibold">
            Training Framework Result
          </span>
        </div>
        <span className="text-gray-600 text-sm italic flex justify-center mb-4">
          The following was the training framework generated from your call...
        </span>

        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <h1 className="text-3xl font-bold mb-3">
              {dentalCleaningWorkflow.title}
            </h1>
            <p className="text-gray-600 mb-2">
              {dentalCleaningWorkflow.description}
            </p>
            <p className="font-semibold mb-2">Usage:</p>
            <p className="text-gray-700">{dentalCleaningWorkflow.usage}</p>
            <p className="text-gray-700 mt-2">
              {dentalCleaningWorkflow.usageContext}
            </p>
          </div>
        </div>

        {/* Vertical Workflow Steps */}
        <div className="relative">
          {dentalCleaningWorkflow.promptBlockSteps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting Line */}
              {index < dentalCleaningWorkflow.promptBlockSteps.length - 1 && (
                <div className="absolute left-4 top-[100px] w-0.5 h-[calc(100%-80px)] bg-primary" />
              )}

              {/* Step Card */}
              <div className="relative flex mb-8">
                {/* Step Number Circle */}
                <div className="absolute left-0 top-6">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center z-10 relative">
                    {index + 1}
                  </div>
                </div>

                {/* Card Content */}
                <div className="ml-16 bg-white rounded-md p-6 border border-gray-200 hover:shadow-lg transition-shadow flex-1">
                  <h2 className="text-xl font-semibold mb-4">{step.title}</h2>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-700">
                        Instructions:
                      </h3>
                      <p className="text-gray-600">{step.instructions}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Example:</h3>
                      <p className="text-gray-600 italic">{step.examples}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Display;
