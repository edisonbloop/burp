"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const TOOLBAR_BTN =
  "p-1.5 rounded text-stone hover:bg-parchment-deep hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed";

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here…",
  minHeight = "200px",
}: Props) {
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        horizontalRule: {},
        bulletList: {},
        orderedList: {},
        blockquote: {},
        code: false,
        codeBlock: false,
        strike: false,
        // Configure Link through StarterKit (it bundles it in v3)
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (editor && value === "") {
      editor.commands.clearContent();
    }
  }, [editor, value]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Paste the URL for this link:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor rounded-xl border border-stone-edge bg-vellum overflow-hidden focus-within:ring-1 focus-within:ring-gold focus-within:border-gold transition">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-stone-edge bg-parchment-soft">
        {/* Headings */}
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Inline marks */}
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <ItalicIcon />
        </ToolbarButton>

        <Divider />

        {/* Blocks */}
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Block Quote"
        >
          <QuoteIcon />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <BulletIcon />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <OrderedIcon />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          active={editor.isActive("link")}
          onClick={addLink}
          title="Insert / edit link"
        >
          <LinkIcon />
        </ToolbarButton>

        <Divider />

        {/* HR */}
        <ToolbarButton
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          —
        </ToolbarButton>

        {/* Undo / Redo */}
        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
            disabled={!editor.can().undo()}
          >
            <UndoIcon />
          </ToolbarButton>
          <ToolbarButton
            active={false}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
            disabled={!editor.can().redo()}
          >
            <RedoIcon />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  children,
  active,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`p-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? "bg-gold-wash text-gold-deep border border-gold-soft"
          : "text-stone-mid hover:bg-parchment-deep hover:text-ink border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-stone-edge mx-1 self-center" />;
}

// ── Inline SVG icons ─────────────────────────────────────────

function BoldIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h8a4 4 0 0 1 0 8H6V4zm0 8h9a4 4 0 0 1 0 8H6v-8z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4h-8z" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
  );
}

function BulletIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="4" cy="6" r="1.5" />
      <rect x="8" y="5" width="12" height="2" rx="1" />
      <circle cx="4" cy="12" r="1.5" />
      <rect x="8" y="11" width="12" height="2" rx="1" />
      <circle cx="4" cy="18" r="1.5" />
      <rect x="8" y="17" width="12" height="2" rx="1" />
    </svg>
  );
}

function OrderedIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17h2v.5H4v1h1v.5H3v1h3v-4H3v1zm1-9h1V4H3v1h1v3zm-1 3h1.8L3 13.1v.9h3v-1H4.2L6 10.9V10H3v1zm5-6v2h12V5H8zm0 14h12v-2H8v2zm0-6h12v-2H8v2z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 15.7c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 15h9V6l-3.6 4.6z" />
    </svg>
  );
}
