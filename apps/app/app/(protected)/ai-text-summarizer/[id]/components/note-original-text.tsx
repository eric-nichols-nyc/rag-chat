type NoteOriginalTextProps = {
  content: string;
};

export function NoteOriginalText({ content }: NoteOriginalTextProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
    </div>
  );
}

