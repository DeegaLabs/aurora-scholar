'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useState } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onMoreOptions?: () => void;
}

export function Editor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...', 
  onMoreOptions,
}: EditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tableRows, setTableRows] = useState('3');
  const [tableCols, setTableCols] = useState('3');
  const [showAlignMenu, setShowAlignMenu] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none px-6 py-4 min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content from props to editor (only when content changes externally)
  // Close align menu when clicking outside
  useEffect(() => {
    if (!showAlignMenu) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-align-menu]')) {
        setShowAlignMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignMenu]);

  useEffect(() => {
    if (!editor) return;
    
    const currentContent = editor.getHTML();
    // Only update if content actually changed (avoid infinite loops)
    // Skip if editor content matches or if both are empty
    const editorIsEmpty = !currentContent || currentContent === '<p></p>' || currentContent === '<p><br></p>';
    const propIsEmpty = !content || content.trim() === '';
    
    if (editorIsEmpty && propIsEmpty) {
      return; // Both empty, no need to update
    }
    
    if (content && content !== currentContent) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const handleSetLink = () => {
    if (!editor) return;

    if (linkUrl) {
      if (linkText) {
        // Insert new link with text
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
      } else {
        // Set link on selected text
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
    } else {
      // Remove link
      editor.chain().focus().unsetLink().run();
    }

    setLinkUrl('');
    setLinkText('');
    setShowLinkModal(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImageUrl(''); // Clear URL when file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertImage = () => {
    if (!editor) return;

    if (imageFile) {
      // Convert file to base64 for now (TODO: upload to Arweave/Irys)
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageSrc = reader.result as string;
        editor.chain().focus().setImage({ src: imageSrc }).run();
        setImageFile(null);
        setImagePreview(null);
        setShowImageModal(false);
      };
      reader.readAsDataURL(imageFile);
    } else if (imageUrl.trim()) {
      // Use URL
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageModal(false);
    }
  };

  const handleInsertTable = () => {
    if (!editor) return;
    const rows = parseInt(tableRows) || 3;
    const cols = parseInt(tableCols) || 3;
    if (rows > 0 && cols > 0) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
      setTableRows('3');
      setTableCols('3');
      setShowTableModal(false);
    }
  };

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
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('bold')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Negrito"
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
          title="Itálico"
        >
          <em>I</em>
        </button>
        <div className="w-px h-6 bg-gray-300" />

        {/* Headings */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (editor.isActive('heading', { level: 1 })) {
              // Se já está em H1, remove o heading (volta para parágrafo)
              editor.chain().focus().setParagraph().run();
            } else {
              // Aplica H1 ao texto selecionado ou parágrafo atual
              editor.chain().focus().setHeading({ level: 1 }).run();
            }
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Título 1"
        >
          <span className="text-xs font-bold">H1</span>
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (editor.isActive('heading', { level: 2 })) {
              // Se já está em H2, remove o heading (volta para parágrafo)
              editor.chain().focus().setParagraph().run();
            } else {
              // Aplica H2 ao texto selecionado ou parágrafo atual
              editor.chain().focus().setHeading({ level: 2 }).run();
            }
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Título 2"
        >
          <span className="text-xs font-bold">H2</span>
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (editor.isActive('heading', { level: 3 })) {
              // Se já está em H3, remove o heading (volta para parágrafo)
              editor.chain().focus().setParagraph().run();
            } else {
              // Aplica H3 ao texto selecionado ou parágrafo atual
              editor.chain().focus().setHeading({ level: 3 }).run();
            }
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Título 3"
        >
          <span className="text-xs font-bold">H3</span>
        </button>
        <div className="w-px h-6 bg-gray-300" />

        {/* Lists */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('bulletList')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Lista com marcadores"
        >
          <span className="text-base">•</span>
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('orderedList')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Lista numerada"
        >
          <span className="text-xs">1.</span>
        </button>
        <div className="w-px h-6 bg-gray-300" />

        {/* Text Alignment */}
        <div className="relative" data-align-menu>
          <button
            onClick={() => setShowAlignMenu(!showAlignMenu)}
            className={`px-3 py-1.5 text-sm font-medium rounded flex items-center gap-1 ${
              editor.isActive({ textAlign: 'left' }) || 
              editor.isActive({ textAlign: 'center' }) || 
              editor.isActive({ textAlign: 'right' }) || 
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Alinhar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showAlignMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <button
                onClick={() => {
                  editor.chain().focus().setTextAlign('left').run();
                  setShowAlignMenu(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-center hover:bg-gray-50 ${
                  editor.isActive({ textAlign: 'left' }) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                title="Alinhar à esquerda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setTextAlign('center').run();
                  setShowAlignMenu(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-center hover:bg-gray-50 ${
                  editor.isActive({ textAlign: 'center' }) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                title="Centralizar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setTextAlign('right').run();
                  setShowAlignMenu(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-center hover:bg-gray-50 ${
                  editor.isActive({ textAlign: 'right' }) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                title="Alinhar à direita"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M12 12h8M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setTextAlign('justify').run();
                  setShowAlignMenu(false);
                }}
                className={`w-full px-3 py-2 flex items-center justify-center hover:bg-gray-50 ${
                  editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                title="Justificar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Indent */}
        <button
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          disabled={!editor.can().liftListItem('listItem')}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Diminuir recuo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          disabled={!editor.can().sinkListItem('listItem')}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Aumentar recuo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="w-px h-6 bg-gray-300" />

        {/* Blockquote & Horizontal Rule */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('blockquote')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Citação"
        >
          &quot;
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          title="Linha horizontal"
        >
          ─
        </button>
        <div className="w-px h-6 bg-gray-300" />

        {/* Link */}
        <button
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkModal(true);
            }
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('link')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Inserir link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        {/* Image */}
        <button
          onClick={() => setShowImageModal(true)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          title="Inserir imagem"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Table */}
        <button
          onClick={() => setShowTableModal(true)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          title="Inserir tabela"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Table Controls (when table is selected) */}
        {editor.isActive('table') && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Adicionar coluna antes"
            >
              +Col
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Adicionar coluna depois"
            >
              Col+
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Remover coluna"
            >
              -Col
            </button>
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Adicionar linha antes"
            >
              +Row
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Adicionar linha depois"
            >
              Row+
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Remover linha"
            >
              -Row
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded"
              title="Remover tabela"
            >
              Del
            </button>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="relative overflow-visible">
        <EditorContent editor={editor} />
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Inserir Link</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && linkUrl.trim()) {
                      handleSetLink();
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto (opcional - usa texto selecionado se vazio)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Texto do link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && linkUrl.trim()) {
                      handleSetLink();
                    }
                  }}
                />
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleSetLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => {
          setShowImageModal(false);
          setImageUrl('');
          setImageFile(null);
          setImagePreview(null);
        }}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Inserir Imagem</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enviar Imagem
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : 'Clique para enviar ou arraste e solte'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF até 10MB</span>
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Preview" className="max-w-full h-32 object-contain rounded border border-gray-200" />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OU</span>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && imageUrl.trim()) {
                      handleInsertImage();
                    }
                  }}
                />
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleInsertImage}
                disabled={!imageUrl.trim() && !imageFile}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowTableModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Inserir Tabela</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Linhas *
                  </label>
                  <input
                    type="number"
                    value={tableRows}
                    onChange={(e) => setTableRows(e.target.value)}
                    min="1"
                    max="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tableRows && tableCols) {
                        handleInsertTable();
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colunas *
                  </label>
                  <input
                    type="number"
                    value={tableCols}
                    onChange={(e) => setTableCols(e.target.value)}
                    min="1"
                    max="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && tableRows && tableCols) {
                        handleInsertTable();
                      }
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                A tabela incluirá uma linha de cabeçalho. Você pode adicionar ou remover linhas e colunas após a inserção.
              </p>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTableModal(false);
                  setTableRows('3');
                  setTableCols('3');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleInsertTable}
                disabled={!tableRows || !tableCols || parseInt(tableRows) < 1 || parseInt(tableCols) < 1}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
