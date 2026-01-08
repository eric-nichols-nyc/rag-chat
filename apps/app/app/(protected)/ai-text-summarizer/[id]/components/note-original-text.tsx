type NoteOriginalTextProps = {
  content: string;
};

export function NoteOriginalText({ content }: NoteOriginalTextProps) {
  return (
    <div className="lg:col-span-1">
      <h2 className="mb-2 font-semibold text-lg">Original Text</h2>
      <div className="rounded-lg border bg-card p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
}

