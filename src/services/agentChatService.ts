import { CONFIG } from '../config';

export interface ChatRequest {
    message: string;
    modelConfig: string;
}

export const agentChatService = {
    async streamChat(
        token: string,
        payload: ChatRequest,
        onChunk: (chunk: string) => void,
        onError: (error: any) => void,
        onComplete: () => void
    ) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/1.0/workflow-agent/prompt/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('Response body is unavailable');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = line.slice(5); // Remove 'data:' prefix
                        // Verify if there is a space after 'data:' that needs removal or if it's raw content
                        // The example show "data:To", "data: submit", so we take the substring and maybe trim start if needed?
                        // Actually, looking at the example: "data:To", "data: submit". 
                        // It seems we should just take slice(5) and append it. 
                        // Wait, "data:To" -> "To". "data: submit" -> " submit".
                        // So slice(5) is correct.
                        onChunk(data);
                    }
                }
            }

            onComplete();

        } catch (error) {
            console.error('Stream error:', error);
            onError(error);
        }
    }
};
