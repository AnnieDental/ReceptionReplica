'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useRef, useEffect } from 'react';
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
        onConnect: () => {
            console.log("Connected to AI Agent");
            toast({
                title: "Connected to AI Agent",
                description: "You can now start speaking",
            });
        },
        onDisconnect: () => {
            console.log("onDisconnect called");
            console.log("Conversation ID:", conversationIdRef.current);
            console.log("Final conversation status:", conversation?.status);

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
        onMessage: (message) => {
            console.log("Message received:", message);
            console.log("Full message object:", JSON.stringify(message, null, 2));
            
            // Check if this is an AI message and handle it
            if (message.source === 'ai') {
                console.log("AI said:", message.message);
            }
        },
        onError: (error) => {
            console.error("Conversation error:", error);
            console.error("Error details:", {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            toast({
                title: "Error",
                description: error.message || "An error occurred with the conversation",
                variant: "destructive",
            });
        },
    });

    const startConversation = useCallback(async () => {
        try {
            console.log("Starting conversation...");
            console.log("Current conversation status:", conversation.status);
            
            // Check if already connected
            if (conversation.status === "connected") {
                console.log("Already connected, skipping...");
                return;
            }
            
            // Request microphone permission
            console.log("Requesting microphone permission...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Microphone permission granted");
            console.log("Audio stream tracks:", stream.getAudioTracks());

            // Start the conversation with your agent
            console.log("Starting session with agent ID: 4uGkYmuvpH9WZlDK3yYN");
            
            try {
                const id = await conversation.startSession({
                    agentId: "4uGkYmuvpH9WZlDK3yYN"
                });
                
                console.log("Conversation started successfully");
                console.log("Conversation ID:", id);
                conversationIdRef.current = id;
            } catch (sessionError) {
                console.error("Session start error:", sessionError);
                throw sessionError;
            }
        } catch (error) {
            console.error("Failed to start conversation:", error);
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

    // Monitor conversation status changes
    useEffect(() => {
        console.log("Conversation status changed to:", conversation.status);
    }, [conversation.status]);

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
                {conversationIdRef.current && (
                    <p className="text-xs text-muted-foreground">
                        Session ID: {conversationIdRef.current}
                    </p>
                )}
            </div>
        </Card>
    );
}