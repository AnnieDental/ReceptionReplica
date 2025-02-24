'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from './ui/use-toast';

export interface ElevenLabsConversationProps {
    onConversationEnd?: (conversationId: string) => void;
}

export function ElevenLabsConversation({
                                           onConversationEnd,
                                       }: ElevenLabsConversationProps) {
    const { toast } = useToast();
    const conversationIdRef = useRef<string | null>(null);

    const conversation = useConversation({
        onConnect: () =>
            toast({
                title: "Connected to AI Agent",
                description: "You can now start speaking",
            }),
        onDisconnect: () => {
            console.log("Disconnected from AI Agent");
            console.log("Conversation ID:", conversationIdRef.current);

            // If the conversation ID exists, pass it to the parent
            if (conversationIdRef.current && onConversationEnd) {
                onConversationEnd(conversationIdRef.current);
            }

            toast({
                title: "Disconnected from AI Agent",
                description: conversationIdRef.current
                    ? `Conversation ID: ${conversationIdRef.current}`
                    : undefined,
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
                agentId: "4uGkYmuvpH9WZlDK3yYN", // replace with the actual agent ID
            });
            console.log("Conversation ID:", id);
            conversationIdRef.current = id;
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