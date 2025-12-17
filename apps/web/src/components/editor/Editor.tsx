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
import { useEffect, useState } from 'react';
import { FloatingAiButtons } from './FloatingAiButtons';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  floatingButtonsEnabled?: boolean;
  onHelpWrite?: () => void;
  onSuggestStructure?: () => void;
  onCheckCoherence?: () => void;
  onMoreOptions?: () => void;
}

export function Editor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...', 
  floatingButtonsEnabled = true,
  onHelpWrite,
  onSuggestStructure,
  onCheckCoherence,
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
          title="Bold"
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
          title="Italic"
        >
          <em>I</em>
        </button>
        <div className="w-px h-6 bg-gray-300" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Heading 1"
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
          title="Heading 2"
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
          title="Heading 3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 text-sm font-medium rounded ${
            editor.isActive('bulletList')
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Bullet List"
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
          title="Numbered List"
        >
          1.
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
          title="Quote"
        >
          &quot;
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          title="Horizontal Rule"
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
          title="Link"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>

        {/* Image */}
        <button
          onClick={() => setShowImageModal(true)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          title="Insert Image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Table */}
        <button
          onClick={() => setShowTableModal(true)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
          title="Insert Table"
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
              title="Add Column Before"
            >
              +Col
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Add Column After"
            >
              Col+
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Delete Column"
            >
              -Col
            </button>
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Add Row Before"
            >
              +Row
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Add Row After"
            >
              Row+
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded"
              title="Delete Row"
            >
              -Row
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded"
              title="Delete Table"
            >
              Del
            </button>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="relative overflow-visible">
        <EditorContent editor={editor} />
        {/* Floating AI Buttons */}
        <FloatingAiButtons
          editor={editor}
          enabled={floatingButtonsEnabled}
          onHelpWrite={onHelpWrite}
          onSuggestStructure={onSuggestStructure}
          onCheckCoherence={onCheckCoherence}
          onMoreOptions={onMoreOptions}
        />
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Insert Link</h3>
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
                  Text (optional - uses selected text if empty)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text"
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
                Cancel
              </button>
              <button
                onClick={handleSetLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert
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
              <h3 className="text-lg font-semibold text-gray-900">Insert Image</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
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
                      {imageFile ? imageFile.name : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</span>
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
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
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
                Cancel
              </button>
              <button
                onClick={handleInsertImage}
                disabled={!imageUrl.trim() && !imageFile}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert
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
              <h3 className="text-lg font-semibold text-gray-900">Insert Table</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rows *
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
                    Columns *
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
                The table will include a header row. You can add or remove rows and columns after insertion.
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
                Cancel
              </button>
              <button
                onClick={handleInsertTable}
                disabled={!tableRows || !tableCols || parseInt(tableRows) < 1 || parseInt(tableCols) < 1}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
