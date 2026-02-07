interface FilePartProps {
  part: {
    type: 'file';
    url: string;
    filename?: string;
    mediaType: string;
  };
}

export function FilePart({ part }: FilePartProps) {
  const isImage = part.mediaType.startsWith('image/');

  return (
    <div className="relative group rounded-lg overflow-hidden border bg-muted/50 max-w-[300px] my-2">
      {isImage ? (
        <img
          src={part.url}
          alt={part.filename || 'Attachment'}
          className="max-h-60 w-auto object-contain mx-auto"
        />
      ) : (
        <div className="p-3 flex items-center gap-2">
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
            {part.mediaType.split('/')[1] || 'file'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium truncate">{part.filename || 'Unnamed file'}</span>
            <span className="text-xs text-muted-foreground uppercase">{part.mediaType}</span>
          </div>
        </div>
      )}
    </div>
  );
}
