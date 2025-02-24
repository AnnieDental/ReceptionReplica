'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';

export function ElevenLabsConversation() {
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () =>
        toast({
          title: "Connected to AI Agent",
          description: "You can now start speaking",
        }),
    onDisconnect: () => {
      if (conversationId) {
        fetch(`http://127.0.0.1:6970/flows/${conversationId}`)
            .then((response) => response.json())
            .then((data) => console.log('Fetched Data:', data))
            .catch((error) => console.error('Fetch Error:', error));
      }

      toast({
        title: "Disconnected from AI Agent",
        description: conversationId ? `Conversation ID: ${conversationId}` : undefined,
      });
    },
    onMessage: (message) => console.log("Message:", message),
    onError: (error) =>
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        }),
  });

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      const id = await conversation.startSession({
        agentId: "4uGkYmuvpH9WZlDK3yYN", // Replace with the actual agent ID as needed.
      });
      setConversationId(id);
    } catch (error) {
      toast({
        title: "Failed to start conversation",
        description:
            error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [conversation, toast]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
      <Card className="w-full max-w-sm p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <Button
              onClick={startConversation}
              disabled={conversation.status === "connected"}
              className="w-full py-6 transition-all duration-300 hover:scale-105"
          >
            Start Conversation
          </Button>
          <Button
              onClick={stopConversation}
              disabled={conversation.status !== "connected"}
              variant="destructive"
              className="w-full py-6 transition-all duration-300 hover:scale-105"
          >
            End Conversation
          </Button>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Status: {conversation.status}
          </p>
          <p className="text-sm text-muted-foreground">
            Agent is {conversation.isSpeaking ? "speaking" : "listening"}
          </p>
        </div>
      </Card>
  );
}