import { Streamdown } from 'streamdown';

interface TextPartProps {
  text: string;
  isStreaming?: boolean;
}

export function TextPart({ text, isStreaming }: TextPartProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
      <Streamdown>{text}</Streamdown>
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-primary/50 animate-pulse align-middle" />
      )}
    </div>
  );
}
