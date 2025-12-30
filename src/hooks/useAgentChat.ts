import { useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { agentChatService } from '../services/agentChatService';
import type { ChatMessage } from '../components/chat-conversation';
import { v4 as uuidv4 } from 'uuid';

export const useAgentChat = () => {
    const { token } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const sendMessage = useCallback(async (content: string, modelConfig: string) => {
        if (!token) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: uuidv4(),
            type: 'text',
            content,
            author: 'You',
            avatar: 'U',
            time: new Date().toLocaleTimeString(),
            isOwn: true,
            status: 'sent'
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setIsThinking(true);

        const timeoutId = setTimeout(() => {
            setIsThinking(false);
        }, 30000);

        const assistantId = uuidv4();
        let messageAdded = false;
        let currentResponse = '';

        await agentChatService.streamChat(
            token,
            { message: content, modelConfig },
            (chunk) => {
                currentResponse += chunk;

                if (!messageAdded) {
                    messageAdded = true;
                    clearTimeout(timeoutId);
                    setIsThinking(false);

                    const assistantMessage: ChatMessage = {
                        id: assistantId,
                        type: 'text',
                        content: currentResponse,
                        author: 'Assistant',
                        avatar: 'AI',
                        time: new Date().toLocaleTimeString(),
                        isOwn: false,
                    };
                    setMessages(prev => [...prev, assistantMessage]);
                } else {
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantId ? { ...msg, content: currentResponse } : msg
                    ));
                }
            },
            (error: unknown) => {
                console.error('Chat stream error:', error);
                clearTimeout(timeoutId);
                setIsThinking(false);

                if (!messageAdded) {
                    messageAdded = true;
                    const errorMessage: ChatMessage = {
                        id: assistantId,
                        type: 'text',
                        content: '[Error generating response]',
                        author: 'Assistant',
                        avatar: 'AI',
                        time: new Date().toLocaleTimeString(),
                        isOwn: false,
                    };
                    setMessages(prev => [...prev, errorMessage]);
                } else {
                    setMessages(prev => prev.map(msg =>
                        msg.id === assistantId ? { ...msg, content: currentResponse + '\n\n[Error generating response]' } : msg
                    ));
                }
                setIsLoading(false);
            },
            () => {
                clearTimeout(timeoutId);
                setIsThinking(false);
                setIsLoading(false);
            }
        );
    }, [token]);

    return {
        messages,
        isLoading,
        isThinking,
        sendMessage
    };
};
