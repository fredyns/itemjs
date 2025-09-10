import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = ''
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-700',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('bold')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('italic')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('strike')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Strike
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          H3
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('bulletList')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('orderedList')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Ordered List
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('link')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={addImage}
          className="px-2 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Image
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('blockquote')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded text-sm font-medium ${
            editor.isActive('codeBlock')
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Code
        </button>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}
