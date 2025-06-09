'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';

// Composants UI basiques pour remplacer les imports manquants
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm' | 'lg';
  }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  };
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Synchroniser le contenu de l'éditeur avec la valeur externe
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      
      // Insérer l'image dans l'éditeur
      insertImage(data.url);
      
      console.log(`Image optimisée: ${data.compression} de compression`);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    event.target.value = '';
  };

  const handleImageUrlInsert = () => {
    if (imageUrl.trim()) {
      insertImage(imageUrl.trim());
      setImageUrl('');
      setShowImageDialog(false);
    }
  };

  const handleLinkInsert = () => {
    if (linkUrl.trim()) {
      insertLink(linkUrl.trim(), linkText.trim() || linkUrl.trim());
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const insertImage = (src: string) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Image';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '10px 0';
    
    insertElementAtCursor(img);
  };

  const insertLink = (url: string, text: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.textContent = text;
    link.style.color = '#2563eb';
    link.style.textDecoration = 'underline';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    insertElementAtCursor(link);
  };

  const insertVariable = (variable: string) => {
    const span = document.createElement('span');
    span.textContent = `{{${variable}}}`;
    span.style.backgroundColor = '#e3f2fd';
    span.style.padding = '2px 6px';
    span.style.borderRadius = '4px';
    span.style.border = '1px solid #81B441';
    span.style.color = '#81B441';
    span.style.fontWeight = 'bold';
    span.setAttribute('data-variable', variable);
    
    insertElementAtCursor(span);
  };

  const insertElementAtCursor = (element: HTMLElement) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(element);
      
      // Positionner le curseur après l'élément inséré
      range.setStartAfter(element);
      range.setEndAfter(element);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (editorRef.current) {
      // Si pas de sélection, ajouter à la fin
      editorRef.current.appendChild(element);
    }
    
    // Mettre à jour le contenu
    handleContentChange();
    
    // Remettre le focus sur l'éditeur
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
    
    // Remettre le focus sur l'éditeur
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Raccourcis clavier
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Format:</span>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('bold')}
            title="Gras (Ctrl+B)"
          >
            <strong>B</strong>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('italic')}
            title="Italique (Ctrl+I)"
          >
            <em>I</em>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('underline')}
            title="Souligné (Ctrl+U)"
          >
            <u>U</u>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowLinkDialog(true)}
            title="Insérer un lien"
          >
            <LinkIcon className="h-4 w-4 mr-1" />
            Lien
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('formatBlock', 'h1')}
            title="Titre 1"
          >
            H1
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('formatBlock', 'h2')}
            title="Titre 2"
          >
            H2
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('formatBlock', 'p')}
            title="Paragraphe"
          >
            P
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertLineBreak')}
            title="Saut de ligne"
          >
            BR
          </Button>
        </div>

        <div className="w-px bg-gray-300 mx-2" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Liste:</span>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            title="Liste à puces"
          >
            • Liste
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            title="Liste numérotée"
          >
            1. Liste
          </Button>
        </div>

        <div className="w-px bg-gray-300 mx-2" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Images:</span>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Uploader une image"
          >
            <PhotoIcon className="h-4 w-4 mr-1" />
            {isUploading ? 'Upload...' : 'Upload'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowImageDialog(true)}
            title="Insérer une image par URL"
          >
            <LinkIcon className="h-4 w-4 mr-1" />
            URL
          </Button>
        </div>

        <div className="w-px bg-gray-300 mx-2" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Variables:</span>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertVariable('eventName')}
            title="Nom de l'événement"
          >
            Événement
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertVariable('participantName')}
            title="Nom du participant"
          >
            Participant
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertVariable('eventDate')}
            title="Date de l'événement"
          >
            Date
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertVariable('eventLocation')}
            title="Lieu de l'événement"
          >
            Lieu
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL du lien</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemple.com"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texte du lien (optionnel)</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Texte à afficher"
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleLinkInsert}
                disabled={!linkUrl.trim()}
                size="sm"
              >
                Insérer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                size="sm"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image URL Dialog */}
      {showImageDialog && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
              className="flex-1"
            />
            <Button
              onClick={handleImageUrlInsert}
              disabled={!imageUrl.trim()}
              size="sm"
            >
              Insérer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowImageDialog(false);
                setImageUrl('');
              }}
              size="sm"
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Éditeur WYSIWYG */}
      <div className="border rounded-lg">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          className="min-h-96 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 prose max-w-none"
          style={{
            lineHeight: '1.6',
            fontSize: '14px'
          }}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder || 'Commencez à taper votre message...'}
        />
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
        <p><strong>💡 Conseils d&apos;utilisation:</strong></p>
        <div className="grid grid-cols-1 gap-1 ml-4">
          <span>• Utilisez les boutons ci-dessus pour formater votre texte</span>
          <span>• Les variables apparaissent en <span className="bg-blue-100 px-1 rounded text-blue-700">bleu</span> et seront remplacées automatiquement</span>
          <span>• Raccourcis: Ctrl+B (gras), Ctrl+I (italique), Ctrl+U (souligné)</span>
          <span>• Cliquez sur &quot;Upload&quot; pour ajouter des images depuis votre ordinateur</span>
        </div>
        <p><strong>📸 Images:</strong> Upload automatique avec optimisation (max 800x600px, compression 85%)</p>
      </div>

      {/* CSS pour le placeholder */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}