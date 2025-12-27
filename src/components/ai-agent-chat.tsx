"use client";

import { ChatConversation } from "./chat-conversation";
import Ai03 from "./ai-03";

export function AiAgentChat() {
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto">
                <ChatConversation />
            </div>

            <div className="mt-auto pr-2 pl-2 pb-4">
                <Ai03 />
            </div>
        </div>
    );
}
