import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  IconBolt,
  IconChevronDown,
  IconCircle,
  IconCircleDashed,
  IconCode,
  IconDeviceLaptop,
  IconHistory,
  IconPaperclip,
  IconPlus,
  IconProgress,
  IconRobot,
  IconSend,
  IconUser,
  IconWand,
  IconWorld,
  IconLoader2
} from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import { useChatModels, type Model } from "../../hooks/useChatModels";
import { providerLogos } from "../agents/constants";

interface AiAgentChatBoxProps {
  onSendMessage: (message: string, modelConfig: string) => void;
  isLoading: boolean;
}

export default function AiAgentChatBox({ onSendMessage, isLoading }: AiAgentChatBoxProps) {
  const [input, setInput] = useState("");
  const { models } = useChatModels();
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("Agent");
  const [selectedPerformance, setSelectedPerformance] = useState("High");
  const [autoMode, setAutoMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default model when models are loaded
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && selectedModel && !isLoading) {
      onSendMessage(input, selectedModel.domain);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getProviderLogo = (provider: string) => {
    return (
      <img
        src={providerLogos[provider] || 'https://logos-api.apistemic.com/domain:openai.com'}
        alt={provider}
        className="size-4 object-contain rounded-sm"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://logos-api.apistemic.com/domain:openai.com';
          (e.target as HTMLImageElement).onerror = null;
        }}
      />
    );
  };

  return (
    <div className="w-full">
      <div className="bg-background border border-border rounded-2xl overflow-hidden">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => { }}
        />

        <div className="px-3 pt-3 pb-2 grow">
          <form onSubmit={handleSubmit}>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="w-full bg-transparent! p-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-foreground placeholder-muted-foreground resize-none border-none outline-none text-sm min-h-10 max-h-[25vh]"
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = target.scrollHeight + "px";
              }}
              disabled={isLoading}
            />
          </form>
        </div>

        <div className="mb-2 px-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-full border border-border hover:bg-accent"
                >
                  <IconPlus className="size-3" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="max-w-xs rounded-2xl p-1.5"
              >
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconPaperclip size={16} className="opacity-60" />
                    Attach Files
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => { }}
                  >
                    <IconCode size={16} className="opacity-60" />
                    Code Interpreter
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => { }}
                  >
                    <IconWorld size={16} className="opacity-60" />
                    Web Search
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-[calc(1rem-6px)] text-xs"
                    onClick={() => { }}
                  >
                    <IconHistory size={16} className="opacity-60" />
                    Chat History
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoMode(!autoMode)}
              className={cn(
                "h-7 px-2 rounded-full border border-border hover:bg-accent ",
                {
                  "bg-primary/10 text-primary border-primary/30": autoMode,
                  "text-muted-foreground": !autoMode,
                }
              )}
            >
              <IconWand className="size-3" />
              <span className="text-xs">Auto</span>
            </Button>
          </div>

          <div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="size-7 p-0 rounded-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <IconLoader2 className="size-3 fill-primary animate-spin" />
              ) : (
                <IconSend className="size-3 fill-primary" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-xs gap-1.5"
            >
              {selectedModel ? (
                <>
                  {getProviderLogo(selectedModel.provider)}
                  <span>{selectedModel.name}</span>
                </>
              ) : (
                <>
                  <IconDeviceLaptop className="size-3" />
                  <span>Select Model</span>
                </>
              )}
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-w-xs rounded-2xl p-1.5 bg-popover border-border"
          >
            <DropdownMenuGroup className="space-y-1">
              {models.length === 0 ? (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  No models available
                </div>
              ) : (
                models.map((model) => (
                  <DropdownMenuItem
                    key={model.id}
                    className="rounded-[calc(1rem-6px)] text-xs gap-2"
                    onClick={() => setSelectedModel(model)}
                  >
                    {getProviderLogo(model.provider)}
                    {model.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-xs"
            >
              <IconUser className="size-3" />
              <span>{selectedAgent}</span>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-w-xs rounded-2xl p-1.5 bg-popover border-border"
          >
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedAgent("Agent")}
              >
                <IconUser size={16} className="opacity-60" />
                Agent
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedAgent("Assistant")}
              >
                <IconRobot size={16} className="opacity-60" />
                Assistant
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 rounded-full border border-transparent hover:bg-accent text-muted-foreground text-xs"
            >
              <IconBolt className="size-3" />
              <span>{selectedPerformance}</span>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-w-xs rounded-2xl p-1.5 bg-popover border-border"
          >
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedPerformance("High")}
              >
                <IconCircle size={16} className="opacity-60" />
                High
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedPerformance("Medium")}
              >
                <IconProgress size={16} className="opacity-60" />
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-[calc(1rem-6px)] text-xs"
                onClick={() => setSelectedPerformance("Low")}
              >
                <IconCircleDashed size={16} className="opacity-60" />
                Low
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />
      </div>
    </div>
  );
}
