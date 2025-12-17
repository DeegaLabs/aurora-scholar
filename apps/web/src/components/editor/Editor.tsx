'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function Editor({ content, onChange, placeholder = 'Start writing...' }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none px-6 py-4 min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="px-6 py-4 min-h-[500px] flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('bold')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('italic')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <em>I</em>
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('bulletList')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('orderedList')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          1.
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('blockquote')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          &quot;
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
        >
          ─
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}

