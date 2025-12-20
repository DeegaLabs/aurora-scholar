# Editor Features - Feature Roadmap

This document lists all possible features for the Aurora Scholar editor, organized by category, with implementation summary.

---

## 📝 Text Formatting

### Bold, Italic, Underline
**Status:** ✅ Implemented (TipTap StarterKit)

### Headings (H1, H2, H3)
**Status:** ✅ Implemented (TipTap StarterKit)

### Lists (Ordered and Unordered)
**Status:** ✅ Implemented (TipTap StarterKit)

### Quotes/Blockquote
**Status:** ✅ Implemented (TipTap StarterKit)

### Inline Code and Code Blocks
**Status:** ⏳ Pending

**Implementation:**
- Install `@tiptap/extension-code` for inline code
- Install `@tiptap/extension-code-block` for code blocks
- Add buttons to toolbar
- Style code blocks with syntax highlighting (optional: use Prism.js or highlight.js)

### Links
**Status:** ⏳ Pending

**Implementation:**
- `@tiptap/extension-link` already available in StarterKit, but needs UI
- Add button to toolbar
- Modal to insert/edit link (URL + text)
- URL validation
- Support for internal links (future)

### Text Colors and Highlight
**Status:** ⏳ Pending

**Implementation:**
- Install `@tiptap/extension-text-style` and `@tiptap/extension-color`
- Add color picker to toolbar
- Support for predefined colors (academic palette)
- Highlight with `@tiptap/extension-highlight`

---

## 🏗️ Structure

### Dividers/Sections
**Status:** ✅ Implemented (TipTap StarterKit - HorizontalRule)

### Tables
**Status:** ⏳ Pending

**Implementation:**
- Install `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-cell`, `@tiptap/extension-table-header`
- Add "Insert Table" button to toolbar
- Modal to choose rows/columns
- Contextual toolbar when selecting table (add/remove rows/columns)
- Border and cell styling

### Images (Upload/Embed)
**Status:** ⏳ Pending

**Implementation:**
- Install `@tiptap/extension-image`
- "Insert Image" button in toolbar
- Upload via API (save to Arweave/Irys)
- Support for external URLs
- Image resizing
- Optional caption
- Alt text for accessibility

### Footnotes
**Status:** ⏳ Pending

**Implementation:**
- Create custom extension or use library
- Automatic numbering system
- Side panel to manage footnotes
- Automatic formatting in export
- Support for multiple styles (numeric, asterisk, etc.)

### Page Breaks
**Status:** ⏳ Pending

**Implementation:**
- `@tiptap/extension-page-break` extension or custom
- Button in toolbar
- Visualization in editor (dotted line)
- Respected in PDF export

---

## 📊 Organization

### Navigation by Headings (Outline)
**Status:** ⏳ Pending

**Implementation:**
- Extract all heading nodes from document
- Create sidebar component with outline
- Clickable navigation (scroll to section)
- Current section indicator during scroll
- Collapse/expand sections

### Find and Replace
**Status:** ⏳ Pending

**Implementation:**
- Install `@tiptap/extension-find` or implement custom
- Search modal (Ctrl+F)
- Result highlighting
- Navigate between results
- Replace (Ctrl+H)
- Options: case-sensitive, whole words, regex

### Word/Character Counter
**Status:** ✅ Implemented (word counter)

**Current Implementation:**
- Word counter displayed in editor footer
- Updates in real-time as user types

**Improvements:**
- Add character counter
- Counter per section
- Word goal (with visual progress)
- Statistics (unique words, average per paragraph)

### Reading Mode/Preview
**Status:** ✅ Implemented (PreviewModal)

**Improvements:**
- Inline reading mode (toggle)
- Reading-optimized styles
- Zoom controls
- Export to PDF directly from preview

---

## 📚 Academic Features

### Citation System (APA, MLA, Chicago, etc.)
**Status:** ⏳ Pending

**Implementation:**
- Library: `citation-js` or `react-citation`
- Modal to insert citation
- Select style (APA, MLA, Chicago, IEEE, etc.)
- Automatic inline formatting: (Author, Year) or [1]
- Manage reference library
- Integration with declared sources (cite directly from sources)

### Integrated Reference Manager
**Status:** ⏳ Pending

**Implementation:**
- Database (Prisma) for references
- Modal to add reference (manual or import)
- Fields: Author, Title, Year, DOI, URL, Type (article, book, etc.)
- Import from DOI, ISBN, BibTeX, RIS
- Search and filters
- Reuse references between articles

### Automatic Bibliography
**Status:** ⏳ Pending

**Implementation:**
- Generate References section automatically
- Sort by chosen style (alphabetical, numeric)
- Automatic formatting according to style
- Update automatically when adding/removing citations
- Configurable positioning (end of document, after conclusion)

### Inline Citation Formatting
**Status:** ⏳ Pending

**Implementation:**
- Mark text as citation
- Visual formatting (quotes, italic)
- Link to full reference
- Support for direct and indirect citations
- Optional page number

---

## 📄 Academic Structure

### Abstract/Summary
**Status:** ⏳ Pending

**Implementation:**
- Dedicated field at top of editor
- Separated from main content
- Specific word counter (usually 150-250 words)
- Pre-formatted templates
- Support for Abstract in multiple languages

### Keywords
**Status:** ⏳ Pending

**Implementation:**
- Dedicated field after Abstract
- Input with tags (chips)
- Suggestions based on content
- Keyword limit (usually 3-10)
- Export to metadata

### Standard Sections (Introduction, Methodology, etc.)
**Status:** ⏳ Pending

**Implementation:**
- Templates with predefined sections
- "Add Section" button with options
- Quick navigation between sections
- Reorder sections (drag & drop)
- Optional sections (Acknowledgments, Appendices)

### Article Templates
**Status:** ⏳ Pending

**Implementation:**
- Template library (Scientific Article, Review, Thesis, etc.)
- Selection modal when creating new document
- Customizable templates
- Save favorite templates
- Templates by field (Sciences, Humanities, Engineering)

---

## 👥 Collaboration

### Inline Comments
**Status:** ⏳ Pending

**Implementation:**
- `@tiptap/extension-comment` extension or custom
- Select text → add comment
- Comment threads
- Resolve comments
- Notifications for new comments
- Integration with user system

### Edit Suggestions (Track Changes)
**Status:** ⏳ Pending

**Implementation:**
- `@tiptap/extension-collaboration` extension or custom
- Suggestion mode (suggest edit without changing)
- Accept/reject suggestions
- Visual of strikethrough (deleted) and underlined (added) text
- Suggestion history
- Compare versions

### Version History
**Status:** ⏳ Pending

**Implementation:**
- Save versions to database (Prisma)
- Timestamp and author for each version
- View previous versions
- Restore version
- Compare versions (diff)
- Automatic versions (every X minutes) and manual (save version)

### Sharing with Permissions
**Status:** ⏳ Pending

**Implementation:**
- Permission system (Reader, Editor, Owner)
- Share by email or link
- Public/private link
- Granular access control
- Collaborator list
- Sharing notifications

---

## 🔗 Integration with Declared Sources

### Cite Declared Sources
**Status:** ⏳ Pending

**Implementation:**
- "Cite Source" button in sources panel
- Modal to choose source and citation style
- Insert formatted citation automatically
- Link between citation and original source
- Validation: can only cite declared sources

### Automatic Source References
**Status:** ⏳ Pending

**Implementation:**
- "References" section generated automatically
- List all declared sources used
- Formatting according to chosen style
- Automatic updates

---

## ✅ Academic Validation

### Plagiarism Check (vs Declared Sources)
**Status:** ⏳ Pending

**Implementation:**
- Compare content with declared sources
- Similarity algorithm (fuzzy matching)
- Highlight similar passages
- Suggest citation when similarity detected
- Originality report

### Coherence Alert with Declared Intuition
**Status:** ⏳ Pending

**Implementation:**
- Semantic analysis of content vs Declared Intuition
- Alerts when content diverges
- Alignment suggestions
- Coherence score

---

## 📤 Export

### Academically Formatted PDF
**Status:** ⏳ Pending

**Implementation:**
- Library: `jsPDF` or `puppeteer` (server-side)
- Formatting: margins, fonts, spacing
- Include Abstract, Keywords, References
- Page numbering
- Headers/Footers
- Metadata (author, date, DOI)

### LaTeX
**Status:** ⏳ Pending

**Implementation:**
- Convert TipTap JSON to LaTeX
- LaTeX templates by style
- Preserve structure (sections, tables, images)
- Export references in BibTeX

### Word (.docx)
**Status:** ⏳ Pending

**Implementation:**
- Library: `docx` or `mammoth`
- Convert TipTap to DOCX
- Preserve formatting
- Include metadata

### Markdown
**Status:** ⏳ Pending

**Implementation:**
- Convert TipTap JSON to Markdown
- Preserve basic structure
- Export images as links

---

## 🤖 AI Assisted (Ethical)

### Structure Suggestions
**Status:** ✅ Implemented

**Implementation:**
- Analyze current content
- Suggest next sections based on declared intuition
- AI provides structure recommendations
- Language-aware responses (respects user's selected language)
- Integrated in Studio panel

### Coherence Verification
**Status:** ✅ Implemented

**Implementation:**
- Compare content with Declared Intuition
- Divergence alerts when content doesn't align
- Alignment suggestions
- Integrated in Studio panel
- Language-aware responses

### Clarity Improvement Suggestions
**Status:** ⏳ Pending

**Implementation:**
- Analyze text clarity
- Suggest clearer paraphrases
- Check for excessive jargon
- Suggest simplifications
- **Never write new content**

### Translation (with usage logging)
**Status:** ⏳ Pending

**Implementation:**
- Select text → translate
- Choose target language
- Log AI usage in metadata
- Keep original + translation
- Translation quality validation

---

## ⛓️ Blockchain

### On-Chain Versioning
**Status:** ⏳ Pending

**Implementation:**
- Hash of each version on blockchain
- Immutable timestamp
- Link between versions (version tree)
- Integrity verification

### Immutable History
**Status:** ⏳ Pending

**Implementation:**
- All versions registered
- Cannot delete versions
- Complete audit trail
- Proof of authorship and timeline

---

## 📋 Implementation Summary by Technology

### Available TipTap Extensions
- `@tiptap/extension-code` - Inline code
- `@tiptap/extension-code-block` - Code blocks
- `@tiptap/extension-link` - Links
- `@tiptap/extension-color` - Colors
- `@tiptap/extension-highlight` - Highlight
- `@tiptap/extension-table` - Tables
- `@tiptap/extension-image` - Images
- `@tiptap/extension-find` - Find
- `@tiptap/extension-collaboration` - Collaboration

### Useful External Libraries
- `citation-js` - Citation system
- `jsPDF` / `puppeteer` - PDF export
- `docx` - Word export
- `prism.js` / `highlight.js` - Syntax highlighting
- `react-tag-input` - Keywords as tags

### Required Backend
- Endpoint for image upload
- Endpoint to manage references
- Endpoint for versioning
- Endpoint for collaboration (WebSocket optional)
- Endpoint for export (PDF, LaTeX, Word)

### Database (Prisma)
- Model `Reference` - Bibliographic references
- Model `Version` - Document versions
- Model `Comment` - Comments
- Model `Collaborator` - Collaborators
- Model `Template` - Saved templates

---

## 🎯 Suggested Prioritization (Optional)

### High Priority
1. Tables
2. Images
3. Links
4. Code (inline and blocks)
5. Colors and highlight
6. Outline/Navigation
7. Find and replace

### Medium Priority
8. Basic citation system
9. Abstract/Keywords
10. Basic templates
11. PDF export
12. Footnotes

### Low Priority
13. Complete reference manager
14. Automatic bibliography
15. Collaboration (comments, track changes)
16. Version history
17. LaTeX/Word export

---

## 🌐 Internationalization (i18n)

### Multi-language Support
**Status:** ✅ Implemented

**Implementation:**
- Full support for Portuguese (PT-BR) and English (EN)
- Language switcher in settings (gear icon)
- All UI texts translated
- AI responses respect selected language
- Language preference stored in cookies
- Uses `next-intl` for translations

**Translated Sections:**
- Editor interface
- Dashboard
- Journal
- AI assistant messages
- Error messages
- Settings and modals

---

**Last updated:** 2024-12-20
**Overall status:** MVP implemented with i18n, advanced features in roadmap
