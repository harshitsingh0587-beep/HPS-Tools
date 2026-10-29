import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../common/Icon';
import { renderPdfPagesFallback } from '../../services/conversion/pdfService';
import { convertImage, ConvertedFileItem, triggerDownload } from '../../services/conversion/imageService';
import { HelpDeskKnowledgeBase } from './HelpDeskKnowledgeBase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachedFile?: {
    name: string;
    size: number;
    type: string;
  };
  convertedResults?: ConvertedFileItem[];
  actionPrompt?: {
    toolPath?: string;
    toolLabel?: string;
    quickConvertType?: 'pdf-to-image' | 'jpg-to-png' | 'png-to-jpg' | 'passport-photo' | 'image-to-pdf';
  };
}

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'helpdesk'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `👋 **Hello! I'm your HPS AI Assistant.**\n\nI can directly fulfill your work across all 21 tools:\n- 📄 **Convert PDF to Image** (attach a PDF or ask me)\n- 🖼️ **Transcode JPG to PNG / PNG to JPG**\n- 📷 **Passport Photo Maker**\n- 📐 **Image Resizer**\n- 📊 **Loan & EMI Calculator**\n- 🔑 **Password Generator** & **DOB Age Calculator**\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-populate input or notify user
      if (!inputMessage) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          setInputMessage('Convert this PDF to image');
        } else if (file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
          setInputMessage('Convert this JPG to PNG');
        } else if (file.name.toLowerCase().endsWith('.png')) {
          setInputMessage('Convert this PNG to JPG');
        }
      }
    }
  };

  // Direct fulfillment of file conversions in chat
  const processDirectFileWork = async (
    file: File,
    workType: 'pdf-to-image' | 'jpg-to-png' | 'png-to-jpg' | 'image-to-pdf'
  ): Promise<ConvertedFileItem[]> => {
    setStatusText('Processing file with client-side engine...');
    if (workType === 'pdf-to-image') {
      const results = await renderPdfPagesFallback(file);
      return results;
    }

    if (workType === 'jpg-to-png') {
      const res = await convertImage(file, { format: 'image/png', quality: 0.95 });
      return [res];
    }

    if (workType === 'png-to-jpg') {
      const res = await convertImage(file, { format: 'image/jpeg', quality: 0.92, fillBackground: '#FFFFFF' });
      return [res];
    }

    // Default image conversion
    const res = await convertImage(file, { format: 'image/png', quality: 0.92 });
    return [res];
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && !selectedFile) return;

    const userMessageId = 'user-' + Date.now().toString(36);
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text || (selectedFile ? `Uploaded ${selectedFile.name}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedFile: selectedFile
        ? {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    const currentAttachedFile = selectedFile;
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setIsProcessing(true);
    setStatusText('Thinking and fulfilling request...');
    scrollToBottom();

    try {
      const lowerText = text.toLowerCase();
      let convertedResults: ConvertedFileItem[] | undefined = undefined;
      let assistantReply = '';
      let actionPrompt: ChatMessage['actionPrompt'] | undefined = undefined;

      // 1. Direct fulfillment if file is attached and conversion is requested
      if (currentAttachedFile) {
        if (
          currentAttachedFile.name.toLowerCase().endsWith('.pdf') ||
          lowerText.includes('pdf to image') ||
          lowerText.includes('convert to image') ||
          lowerText.includes('convert to png')
        ) {
          setStatusText('Extracting and rendering high-resolution PDF pages...');
          convertedResults = await processDirectFileWork(currentAttachedFile, 'pdf-to-image');
          assistantReply = `✅ **PDF successfully converted to high-resolution images!**\n\nI processed **${currentAttachedFile.name}** directly in your browser. Below are the rendered page images ready for preview and instant download.`;
          actionPrompt = {
            toolPath: '/tools/pdf-to-image',
            toolLabel: 'Open Full PDF to Image Tool',
          };
        } else if (
          lowerText.includes('jpg to png') ||
          (currentAttachedFile.type.includes('jpeg') && lowerText.includes('png'))
        ) {
          setStatusText('Transcoding JPG to lossless PNG...');
          convertedResults = await processDirectFileWork(currentAttachedFile, 'jpg-to-png');
          assistantReply = `✅ **Transcoded JPG to PNG!**\n\nI converted **${currentAttachedFile.name}** into a clean, lossless PNG image. Download your file below.`;
          actionPrompt = {
            toolPath: '/tools/jpg-to-png',
            toolLabel: 'Open JPG to PNG Tool',
          };
        } else if (
          lowerText.includes('png to jpg') ||
          (currentAttachedFile.type.includes('png') && lowerText.includes('jpg'))
        ) {
          setStatusText('Transcoding PNG to crisp JPG...');
          convertedResults = await processDirectFileWork(currentAttachedFile, 'png-to-jpg');
          assistantReply = `✅ **Transcoded PNG to JPG!**\n\nI converted **${currentAttachedFile.name}** to optimized JPG with clean white background. Download your file below.`;
          actionPrompt = {
            toolPath: '/tools/png-to-jpg',
            toolLabel: 'Open PNG to JPG Tool',
          };
        }
      }

      // If no file was converted directly, check for server AI or smart intent
      if (!convertedResults) {
        // Send request to server AI endpoint
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-5).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          assistantReply = data.reply || 'Here is how I can help with HPS Tools.';
        } else {
          assistantReply = 'I am available to assist you. Ask me to convert PDF to Image, transcode pictures, calculate loans, or generate secure passwords.';
        }

        // Attach smart quick action prompts
        if (lowerText.includes('pdf to image') || lowerText.includes('pdf to png')) {
          actionPrompt = {
            toolPath: '/tools/pdf-to-image',
            toolLabel: 'Launch PDF to Image Tool',
          };
        } else if (lowerText.includes('passport')) {
          actionPrompt = {
            toolPath: '/tools/passport-photo-maker',
            toolLabel: 'Launch Passport Photo Maker',
          };
        } else if (lowerText.includes('loan') || lowerText.includes('mortgage') || lowerText.includes('emi')) {
          actionPrompt = {
            toolPath: '/tools/loan-calculator',
            toolLabel: 'Open Loan & EMI Calculator',
          };
        } else if (lowerText.includes('password')) {
          actionPrompt = {
            toolPath: '/tools/password-generator',
            toolLabel: 'Open Password Generator',
          };
        } else if (lowerText.includes('dob') || lowerText.includes('age') || lowerText.includes('birthday')) {
          actionPrompt = {
            toolPath: '/tools/dob-calculator',
            toolLabel: 'Open Date of Birth Calculator',
          };
        } else if (lowerText.includes('resize')) {
          actionPrompt = {
            toolPath: '/tools/image-resizer',
            toolLabel: 'Open Image Resizer',
          };
        } else if (lowerText.includes('convert all') || lowerText.includes('converter')) {
          actionPrompt = {
            toolPath: '/tools/convert-all',
            toolLabel: 'Open Universal Converter Hub',
          };
        }
      }

      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now().toString(36),
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        convertedResults,
        actionPrompt,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI assistant processing error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'error-' + Date.now().toString(36),
        role: 'assistant',
        content: `I encountered an issue processing that action. You can directly access the tool in the catalog or attach your file again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
      setStatusText(null);
      scrollToBottom();
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="HPS AI Assistant"
    >
      <div
        className="w-full sm:max-w-lg h-[92vh] sm:h-[650px] bg-hps-surface border border-hps-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-hps-text transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-hps-border bg-hps-bg/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-hps-primary text-white shadow-xs">
              <Icon name="Sparkles" size={20} className="text-hps-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">HPS AI Assistant</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-hps-muted">
                Simple Tools. One Place. • Created by Harshit
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'reset-msg',
                    role: 'assistant',
                    content: 'Chat refreshed. How can I fulfill your tasks today?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="p-2 rounded-xl text-hps-muted hover:text-hps-text hover:bg-hps-border/30 transition-colors"
              title="Clear conversation"
            >
              <Icon name="RotateCcw" size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-hps-muted hover:text-hps-text hover:bg-hps-border/30 transition-colors"
              aria-label="Close AI Assistant"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs: Chat & Fulfill vs Help Desk Knowledge Base */}
        <div className="flex border-b border-hps-border bg-hps-bg/50 px-3 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'border-hps-primary text-hps-primary font-bold'
                : 'border-transparent text-hps-muted hover:text-hps-text'
            }`}
          >
            <Icon name="MessageSquare" size={14} />
            <span>AI Chat & Fulfill</span>
          </button>
          <button
            onClick={() => setActiveTab('helpdesk')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'helpdesk'
                ? 'border-hps-primary text-hps-primary font-bold'
                : 'border-transparent text-hps-muted hover:text-hps-text'
            }`}
          >
            <Icon name="BookOpen" size={14} className="text-hps-accent" />
            <span>Help Desk Guides</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-hps-accent/20 text-hps-accent border border-hps-accent/30">
              8 Guides
            </span>
          </button>
        </div>

        {activeTab === 'helpdesk' ? (
          <div className="flex-1 overflow-hidden">
            <HelpDeskKnowledgeBase
              onNavigate={onNavigate}
              onClose={onClose}
              onSelectGuideForChat={(prompt) => {
                setActiveTab('chat');
                handleSendMessage(prompt);
              }}
            />
          </div>
        ) : (
          <>
            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-hps-bg/40 border-b border-hps-border overflow-x-auto flex items-center gap-1.5 no-scrollbar text-[11px] shrink-0">
              <button
                onClick={() => handleQuickPrompt('How do I convert PDF to image?')}
                className="px-2.5 py-1 rounded-lg border border-hps-border bg-hps-surface hover:border-hps-primary/50 text-hps-text shrink-0 transition-colors flex items-center gap-1"
              >
                <Icon name="FileText" size={12} className="text-hps-primary" />
                <span>Convert PDF to Image</span>
              </button>
              <button
                onClick={() => handleQuickPrompt('How to create passport photo?')}
                className="px-2.5 py-1 rounded-lg border border-hps-border bg-hps-surface hover:border-hps-primary/50 text-hps-text shrink-0 transition-colors flex items-center gap-1"
              >
                <Icon name="Camera" size={12} className="text-hps-accent" />
                <span>Passport Photo</span>
              </button>
              <button
                onClick={() => handleQuickPrompt('Generate a strong 16-character password')}
                className="px-2.5 py-1 rounded-lg border border-hps-border bg-hps-surface hover:border-hps-primary/50 text-hps-text shrink-0 transition-colors flex items-center gap-1"
              >
                <Icon name="Key" size={12} className="text-amber-500" />
                <span>Generate Password</span>
              </button>
              <button
                onClick={() => handleQuickPrompt('Calculate loan payment for 100,000 at 6% for 30 years')}
                className="px-2.5 py-1 rounded-lg border border-hps-border bg-hps-surface hover:border-hps-primary/50 text-hps-text shrink-0 transition-colors flex items-center gap-1"
              >
                <Icon name="DollarSign" size={12} className="text-emerald-500" />
                <span>Loan Calculator</span>
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-hps-muted px-1">
                  <span>{isUser ? 'You' : 'HPS Assistant'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs whitespace-pre-wrap ${
                    isUser
                      ? 'bg-hps-primary text-white rounded-br-xs'
                      : 'bg-hps-bg border border-hps-border text-hps-text rounded-bl-xs'
                  }`}
                >
                  {/* File Attachment Pill */}
                  {m.attachedFile && (
                    <div className="mb-2 p-2 rounded-xl bg-black/10 border border-white/10 flex items-center gap-2">
                      <Icon name="Paperclip" size={14} />
                      <div className="truncate">
                        <p className="font-bold truncate text-[11px]">{m.attachedFile.name}</p>
                        <p className="text-[10px] opacity-75 font-mono">
                          {(m.attachedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  )}

                  <div>{m.content}</div>

                  {/* Render Converted Result Cards directly inside chat */}
                  {m.convertedResults && m.convertedResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-hps-border/50 space-y-2">
                      <p className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Icon name="CheckCircle" size={13} />
                        <span>Ready for Download ({m.convertedResults.length} file{m.convertedResults.length > 1 ? 's' : ''}):</span>
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {m.convertedResults.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl border border-hps-border bg-hps-surface flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {item.url && (
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-hps-border shrink-0 bg-white"
                                />
                              )}
                              <div className="truncate">
                                <p className="font-bold text-[11px] truncate text-hps-text">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-hps-muted font-mono">
                                  {(item.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => triggerDownload(item.url, item.name)}
                              className="px-3 py-1.5 rounded-lg bg-hps-primary text-white text-[11px] font-bold hover:bg-hps-primary/90 flex items-center gap-1 shrink-0 shadow-2xs"
                            >
                              <Icon name="Download" size={12} />
                              <span>Download</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Navigation Pill */}
                  {m.actionPrompt && m.actionPrompt.toolPath && (
                    <div className="mt-3 pt-2 border-t border-hps-border/40 flex justify-end">
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate(m.actionPrompt!.toolPath!);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-hps-accent/20 border border-hps-accent/40 text-hps-text font-bold text-[11px] hover:bg-hps-accent/30 transition-colors cursor-pointer"
                      >
                        <Icon name="ExternalLink" size={12} className="text-hps-accent" />
                        <span>{m.actionPrompt.toolLabel || 'Open Tool Workspace'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-hps-bg border border-hps-border w-fit text-xs text-hps-muted animate-pulse">
              <Icon name="Loader" size={14} className="animate-spin text-hps-primary" />
              <span>{statusText || 'AI Assistant is working...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected file preview pill */}
        {selectedFile && (
          <div className="px-4 py-2 bg-hps-bg border-t border-hps-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="p-1 rounded bg-hps-primary/10 text-hps-primary">
                <Icon name="Paperclip" size={13} />
              </span>
              <span className="font-semibold truncate max-w-[200px] text-hps-text">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-hps-muted font-mono">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-hps-muted hover:text-red-500 p-1"
              title="Remove file"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-hps-border bg-hps-surface flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border border-hps-border bg-hps-bg hover:border-hps-primary hover:text-hps-primary text-hps-muted transition-colors cursor-pointer"
            title="Attach file (PDF, Image) for instant in-chat conversion"
            aria-label="Attach file"
          >
            <Icon name="Paperclip" size={16} />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={
              selectedFile
                ? 'Tell me what to do with this file (e.g., convert to image)...'
                : 'Ask AI or command: "convert pdf to image", "loan 100k @ 5%"...'
            }
            className="flex-1 py-2.5 px-3.5 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-none focus:border-hps-primary"
            disabled={isProcessing}
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isProcessing || (!inputMessage.trim() && !selectedFile)}
            className="p-2.5 rounded-xl bg-hps-primary text-white hover:bg-hps-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            title="Send request"
            aria-label="Send message"
          >
            <Icon name="Send" size={16} />
          </button>
        </div>
      </>
    )}
  </div>
</div>
);
};
