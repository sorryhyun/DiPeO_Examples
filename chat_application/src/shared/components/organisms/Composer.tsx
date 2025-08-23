import { useState, useRef, KeyboardEvent } from 'react';
import Button from '../atoms/Button';
import FileUploader from '../molecules/FileUploader';
import EmojiPicker from '../molecules/EmojiPicker';
import { useToast } from '../../hooks/useToast';

export interface ComposerPayload {
  content: string;
  attachments: File[];
}

interface ComposerProps {
  onSend: (payload: ComposerPayload) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export default function Composer({ 
  onSend, 
  placeholder = "Type a message...", 
  disabled = false 
}: ComposerProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addToast } = useToast();

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!content.trim() && attachments.length === 0) return;
    if (isSending || disabled) return;

    const payload: ComposerPayload = {
      content: content.trim(),
      attachments
    };

    const originalContent = content;
    const originalAttachments = [...attachments];

    // Optimistic UI: clear input immediately
    setContent('');
    setAttachments([]);
    setIsSending(true);

    try {
      await onSend(payload);
    } catch (error) {
      // Restore content on failure
      setContent(originalContent);
      setAttachments(originalAttachments);
      showToast({
        type: 'error',
        message: 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + emoji + content.slice(end);
      setContent(newContent);
      
      // Focus back and set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (files: File[]) => {
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const isDisabled = disabled || isSending;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm"
            >
              <span className="truncate max-w-32">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={isDisabled}
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 items-end">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     min-h-[42px] max-h-32 overflow-y-auto"
            style={{
              height: 'auto',
              minHeight: '42px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 items-center">
          {/* File upload */}
          <FileUploader
            onFilesSelected={handleFileUpload}
            disabled={isDisabled}
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />

          {/* Emoji picker */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={isDisabled}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Open emoji picker"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={isDisabled || (!content.trim() && attachments.length === 0)}
            isLoading={isSending}
            variant="primary"
            size="md"
            className="px-4"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
