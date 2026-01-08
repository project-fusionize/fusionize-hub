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

            let buffer = '';
            let isFirstDataInEvent = true;

            const processLine = (line: string) => {
                if (line.trim() === '') {
                    isFirstDataInEvent = true;
                    return;
                }
                if (line.startsWith('data:')) {
                    const data = line.slice(5);
                    if (!isFirstDataInEvent) {
                        onChunk('\n' + data);
                    } else {
                        onChunk(data);
                        isFirstDataInEvent = false;
                    }
                }
            };

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    buffer += decoder.decode();
                    if (buffer.length > 0) {
                        const lines = buffer.split('\n');
                        for (const line of lines) {
                            processLine(line);
                        }
                    }
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');

                buffer = lines.pop() || '';

                for (const line of lines) {
                    processLine(line);
                }
            }

            onComplete();

        } catch (error) {
            console.error('Stream error:', error);
            onError(error);
        }
    }
};
