/**
 * Renders stored Tiptap HTML safely using the shared burp-prose styles.
 * Server-compatible — no client boundary needed.
 */
export default function RichTextContent({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  if (!html || html === "<p></p>") return null;

  return (
    <div
      className={`burp-prose text-base text-ink leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
