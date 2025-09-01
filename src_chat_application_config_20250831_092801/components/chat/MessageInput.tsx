import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageCreateDTO, User } from '@/core/contracts';
import { useAuth } from '@/hooks/useAuth';
import { messagesService } from '@/services/messages.service';
import { usersService } from '@/services/users.service';
import { EmojiPicker } from '@/components/chat/EmojiPicker';
import { FileUpload } from '@/components/chat/FileUpload';
import { debounce } from '@/core/utils';

interface MessageInputProps {
  channelId: string;
  threadId?: string;
  placeholder?: string;
  disabled?: boolean;
  onMessageSent?: () => void;
  className?: string;
}

interface MentionMatch {
  user: User;
  startIndex: number;
  endIndex: number;
  query: string;
}

export function MessageInput({
  channelId,
  threadId,
  placeholder = 'Type a message...',
  disabled = false,
  onMessageSent,
  className = '',
}: MessageInputProps) {
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);
  const [activeMention, setActiveMention] = useState<MentionMatch | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileUploadRef = useRef<HTMLDivElement>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const maxHeight = 120; // ~6 lines
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  // Handle textarea input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    adjustTextareaHeight();

    // Check for mention trigger (@)
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      const hasSpaceAfterAt = textAfterAt.includes(' ');
      
      if (!hasSpaceAfterAt && textAfterAt.length >= 0) {
        // We have a potential mention
        const query = textAfterAt;
        setActiveMention({
          user: {} as User, // Placeholder
          startIndex: lastAtIndex,
          endIndex: cursorPosition,
          query,
        });
        
        // Debounced search for users
        debouncedSearchUsers(query);
      } else {
        setActiveMention(null);
        setMentionSuggestions([]);
      }
    } else {
      setActiveMention(null);
      setMentionSuggestions([]);
    }
  }, [adjustTextareaHeight]);

  // Debounced user search for mentions
  const debouncedSearchUsers = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setMentionSuggestions([]);
        return;
      }

      try {
        const result = await usersService.searchUsers(query);
        if (result.ok && result.data) {
          setMentionSuggestions(result.data.items.slice(0, 5)); // Limit to 5 suggestions
          setSelectedSuggestionIndex(0);
        }
      } catch (error) {
        console.warn('Failed to search users for mentions:', error);
        setMentionSuggestions([]);
      }
    }, 300),
    []
  );

  // Handle mention selection
  const selectMention = useCallback((user: User) => {
    if (!activeMention || !textareaRef.current) return;

    const beforeMention = message.slice(0, activeMention.startIndex);
    const afterMention = message.slice(activeMention.endIndex);
    const mentionText = `@${user.displayName}`;
    
    const newMessage = `${beforeMention}${mentionText} ${afterMention}`;
    setMessage(newMessage);
    
    // Set cursor position after the mention
    const newCursorPos = beforeMention.length + mentionText.length + 1;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);

    setActiveMention(null);
    setMentionSuggestions([]);
  }, [activeMention, message]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const beforeCursor = message.slice(0, cursorPosition);
    const afterCursor = message.slice(cursorPosition);
    
    const newMessage = `${beforeCursor}${emoji}${afterCursor}`;
    setMessage(newMessage);
    
    // Set cursor position after emoji
    const newCursorPos = cursorPosition + emoji.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        adjustTextareaHeight();
      }
    }, 0);

    setShowEmojiPicker(false);
  }, [message, adjustTextareaHeight]);

  // Handle file selection
  const handleFileSelect = useCallback((files: File[]) => {
    // For now, just close the file upload modal
    // In a real implementation, you'd upload files and attach them to the message
    setShowFileUpload(false);
    
    if (files.length > 0) {
      const fileText = files.map(f => f.name).join(', ');
      setMessage(prev => `${prev}📎 ${fileText} `);
      adjustTextareaHeight();
    }
  }, [adjustTextareaHeight]);

  // Submit message
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!currentUser || !message.trim() || isSubmitting) return;

    const messageData: MessageCreateDTO = {
      channelId,
      text: message.trim(),
      ...(threadId && { replyToId: threadId }),
    };

    setIsSubmitting(true);

    try {
      const result = await messagesService.createMessage(messageData);
      
      if (result.ok) {
        setMessage('');
        adjustTextareaHeight();
        onMessageSent?.();
      } else {
        console.error('Failed to send message:', result.error);
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, message, isSubmitting, channelId, threadId, onMessageSent, adjustTextareaHeight]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention suggestions navigation
    if (mentionSuggestions.length > 0 && activeMention) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < mentionSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : mentionSuggestions.length - 1
        );
        return;
      }
      
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selectedUser = mentionSuggestions[selectedSuggestionIndex];
        if (selectedUser) {
          selectMention(selectedUser);
        }
        return;
      }
      
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveMention(null);
        setMentionSuggestions([]);
        return;
      }
    }

    // Submit on Enter (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Quick emoji picker toggle
    if (e.key === ':' && e.ctrlKey) {
      e.preventDefault();
      setShowEmojiPicker(prev => !prev);
    }
  }, [mentionSuggestions, activeMention, selectedSuggestionIndex, selectMention, handleSubmit]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
      
      if (fileUploadRef.current && !fileUploadRef.current.contains(target)) {
        setShowFileUpload(false);
      }
      
      if (mentionListRef.current && !mentionListRef.current.contains(target)) {
        setActiveMention(null);
        setMentionSuggestions([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  if (!currentUser) {
    return null;
  }

  const hasContent = message.trim().length > 0;
  const canSubmit = hasContent && !isSubmitting && !disabled;

  return (
    <div className={`relative bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Mention suggestions */}
      {mentionSuggestions.length > 0 && activeMention && (
        <div
          ref={mentionListRef}
          className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg shadow-lg max-h-40 overflow-y-auto z-10"
        >
          {mentionSuggestions.map((user, index) => (
            <button
              key={user.id}
              onClick={() => selectMention(user)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 ${
                index === selectedSuggestionIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user.displayName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  @{user.displayName.toLowerCase().replace(/\s+/g, '')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main input area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSubmitting}
              rows={1}
              className="w-full resize-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Message input"
              aria-describedby="message-input-help"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* File upload */}
            <div ref={fileUploadRef} className="relative">
              <button
                type="button"
                onClick={() => setShowFileUpload(prev => !prev)}
                disabled={disabled || isSubmitting}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Attach file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {showFileUpload && (
                <div className="absolute bottom-full right-0 mb-2">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onClose={() => setShowFileUpload(false)}
                  />
                </div>
              )}
            </div>

            {/* Emoji picker */}
            <div ref={emojiPickerRef} className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(prev => !prev)}
                disabled={disabled || isSubmitting}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add emoji"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
            <button
              type="submit"
              disabled={!canSubmit}
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Send message"
            >
              {isSubmitting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Help text */}
        <div id="message-input-help" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Enter to send, Shift+Enter for new line, @ to mention users
        </div>
      </div>
    </div>
  );
}

export default MessageInput;
