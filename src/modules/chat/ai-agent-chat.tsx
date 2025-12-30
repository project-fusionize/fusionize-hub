"use client";

import { useAgentChat } from "../../hooks/useAgentChat";
import { ChatConversation } from "../../components/chat-conversation";
import AiAgentChatBox from "./ai-agent-chat-box";

export function AiAgentChat() {
    const { messages, isLoading, isThinking, sendMessage } = useAgentChat();

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto">
                <ChatConversation
                    messages={messages.length > 0 ? messages : undefined}
                    isThinking={isThinking}
                />
            </div>

            <div className="mt-auto pr-2 pl-2 pb-4">
                <AiAgentChatBox onSendMessage={sendMessage} isLoading={isLoading} />
            </div>
        </div>
    );
}
