'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { FileText, FileType, Presentation, Mail, Check, X, Share2, Send, Loader2 } from 'lucide-react';
import { Button, toast } from '@/components/ui';

interface ShareSelectorProps {
  content: string;
  onClose: () => void;
  className?: string;
}

type ExportFormat = 'pdf' | 'doc' | 'pptx';
type Tab = 'export' | 'email';

// Extract title from content (first ## heading or first line)
function extractTitle(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('## ')) {
      return line.slice(3).trim();
    }
    if (line.startsWith('# ')) {
      return line.slice(2).trim();
    }
  }
  // Fallback to first non-empty line
  const firstLine = lines.find(l => l.trim().length > 0);
  return firstLine?.slice(0, 50) || 'AI Insights Report';
}

// Generate email subject based on content
function generateSubject(content: string): string {
  const title = extractTitle(content);
  return `Meta Learnings: ${title}`;
}

// Generate email message/summary based on content
function generateMessage(content: string): string {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const title = extractTitle(content);

  // Find key findings or bullet points
  const keyPoints: string[] = [];
  let inKeyFindings = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('key finding') || line.toLowerCase().includes('summary') || line.toLowerCase().includes('recommendation')) {
      inKeyFindings = true;
      continue;
    }
    if (inKeyFindings && (line.startsWith('- ') || line.startsWith('• ') || line.match(/^\d+\./))) {
      const point = line.replace(/^[-•\d.]\s*/, '').trim();
      if (point && keyPoints.length < 3) {
        keyPoints.push(point);
      }
    }
    if (line.startsWith('##') && inKeyFindings) {
      inKeyFindings = false;
    }
  }

  // Build message
  let message = `Hi,\n\nI'm sharing an AI-generated insight report on "${title}".\n\n`;

  if (keyPoints.length > 0) {
    message += `Key highlights:\n`;
    keyPoints.forEach(point => {
      message += `• ${point}\n`;
    });
    message += '\n';
  }

  message += `Please find the detailed analysis attached/below.\n\nBest regards`;

  return message;
}

export function ShareSelector({ content, onClose, className }: ShareSelectorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('export');
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null);

  // Auto-generate email fields based on content
  const autoSubject = useMemo(() => generateSubject(content), [content]);
  const autoMessage = useMemo(() => generateMessage(content), [content]);

  // Email form state - initialized with auto-generated values
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState(autoSubject);
  const [emailMessage, setEmailMessage] = useState(autoMessage);
  const [attachmentFormat, setAttachmentFormat] = useState<ExportFormat>('pdf');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const exportFormats: { id: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" />, description: 'Portable Document' },
    { id: 'doc', label: 'Word', icon: <FileType className="w-4 h-4" />, description: 'Microsoft Word' },
    { id: 'pptx', label: 'PowerPoint', icon: <Presentation className="w-4 h-4" />, description: 'Presentation' },
  ];

  const handleExport = (format: ExportFormat) => {
    setExportedFormat(format);

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Meta Learnings Report</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #5B50BD; font-size: 24px; margin-bottom: 8px; }
              h2 { color: #374151; font-size: 18px; margin-top: 24px; }
              p { color: #4B5563; line-height: 1.6; }
              .header { border-bottom: 2px solid #5B50BD; padding-bottom: 16px; margin-bottom: 24px; }
              .date { color: #6B7280; font-size: 14px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Meta Learnings Report</h1>
              <p class="date">Generated: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</p>
            </div>
            <div class="content">${content.replace(/\n/g, '<br>')}</div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success('PDF Export', 'Print dialog opened. Save as PDF.');
    } else if (format === 'doc') {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head><meta charset="utf-8"><title>Meta Learnings Report</title></head>
        <body>
          <h1 style="color: #5B50BD;">Meta Learnings Report</h1>
          <p style="color: #6B7280;">Generated: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}</p>
          <hr/>
          <div style="white-space: pre-wrap; font-family: Arial, sans-serif;">${content.replace(/\n/g, '<br>')}</div>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meta-learnings-report-${Date.now()}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Word Export', 'Document downloaded.');
    } else if (format === 'pptx') {
      const slides = content.split(/##\s+/).filter(Boolean);
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint'>
        <head><meta charset="utf-8"><title>Meta Learnings Report</title></head>
        <body>
          <div style="page-break-after: always; padding: 60px; min-height: 500px;">
            <h1 style="color: #5B50BD; font-size: 36px; text-align: center; margin-top: 200px;">Meta Learnings Report</h1>
            <p style="text-align: center; color: #6B7280; font-size: 18px;">${new Date().toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}</p>
          </div>
          ${slides.map(slide => `
            <div style="page-break-after: always; padding: 40px; min-height: 500px;">
              <div style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px;">${slide.replace(/\n/g, '<br>')}</div>
            </div>
          `).join('')}
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-powerpoint' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meta-learnings-report-${Date.now()}.ppt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PowerPoint Export', 'Presentation downloaded.');
    }

    setTimeout(() => {
      setExportedFormat(null);
    }, 1500);
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      toast.error('Error', 'Please enter recipient email address.');
      return;
    }

    setIsSending(true);

    // Simulate sending email (in real app, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSending(false);
    setEmailSent(true);
    toast.success('Email Sent!', `Report sent to ${emailTo}`);

    setTimeout(() => {
      setEmailSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className={cn(
      'animate-in slide-in-from-bottom-2 duration-200',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Share2 className="w-3.5 h-3.5 text-[#5B50BD] dark:text-[#918AD3]" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Share options
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
        <button
          onClick={() => setActiveTab('export')}
          className={cn(
            'flex-1 px-3 py-2 text-xs font-medium transition-colors',
            activeTab === 'export'
              ? 'text-[#5B50BD] dark:text-[#918AD3] border-b-2 border-[#5B50BD] dark:border-[#918AD3]'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          Export
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={cn(
            'flex-1 px-3 py-2 text-xs font-medium transition-colors',
            activeTab === 'email'
              ? 'text-[#5B50BD] dark:text-[#918AD3] border-b-2 border-[#5B50BD] dark:border-[#918AD3]'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          Email
        </button>
      </div>

      <div className="space-y-3">
        {activeTab === 'export' ? (
          /* Export Tab */
          <div className="grid grid-cols-3 gap-2">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                disabled={exportedFormat !== null}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-lg',
                  'border border-gray-200 dark:border-gray-700',
                  'hover:border-[#5B50BD] dark:hover:border-[#918AD3]',
                  'hover:bg-[#5B50BD]/5 dark:hover:bg-[#918AD3]/5',
                  'transition-all duration-150',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  exportedFormat === format.id && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg',
                  exportedFormat === format.id
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                )}>
                  {exportedFormat === format.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    format.icon
                  )}
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {format.label}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {format.description}
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* Email Tab */
          <div className="space-y-3">
            {emailSent ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Sent!</p>
                <p className="text-xs text-gray-500">Report sent to {emailTo}</p>
              </div>
            ) : (
              <>
                {/* To */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                    To
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    disabled={isSending}
                    className={cn(
                      'w-full px-2.5 py-1.5 rounded-lg text-xs',
                      'border border-gray-200 dark:border-gray-700',
                      'bg-gray-50 dark:bg-gray-800/50',
                      'text-gray-900 dark:text-gray-100',
                      'placeholder:text-gray-400',
                      'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]/20',
                      'focus:border-[#5B50BD] dark:focus:border-[#918AD3]',
                      'disabled:opacity-50'
                    )}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Subject
                    <span className="ml-1 text-[9px] text-[#5B50BD] dark:text-[#918AD3]">(auto-generated)</span>
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    disabled={isSending}
                    className={cn(
                      'w-full px-2.5 py-1.5 rounded-lg text-xs',
                      'border border-gray-200 dark:border-gray-700',
                      'bg-gray-50 dark:bg-gray-800/50',
                      'text-gray-900 dark:text-gray-100',
                      'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]/20',
                      'focus:border-[#5B50BD] dark:focus:border-[#918AD3]',
                      'disabled:opacity-50'
                    )}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Message
                    <span className="ml-1 text-[9px] text-[#5B50BD] dark:text-[#918AD3]">(auto-generated)</span>
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Email message..."
                    rows={5}
                    disabled={isSending}
                    className={cn(
                      'w-full px-2.5 py-1.5 rounded-lg text-xs resize-y',
                      'border border-gray-200 dark:border-gray-700',
                      'bg-gray-50 dark:bg-gray-800/50',
                      'text-gray-900 dark:text-gray-100',
                      'placeholder:text-gray-400',
                      'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]/20',
                      'focus:border-[#5B50BD] dark:focus:border-[#918AD3]',
                      'disabled:opacity-50'
                    )}
                  />
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                    Attachment
                  </label>

                  {/* Format Selection */}
                  <div className="flex gap-1.5 mb-2">
                    {exportFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setAttachmentFormat(format.id)}
                        disabled={isSending}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium',
                          'border transition-all duration-150',
                          attachmentFormat === format.id
                            ? 'border-[#5B50BD] dark:border-[#918AD3] bg-[#5B50BD]/10 dark:bg-[#918AD3]/10 text-[#5B50BD] dark:text-[#918AD3]'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        {format.icon}
                        <span>{format.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Attachment Preview */}
                  <div className={cn(
                    'flex items-center gap-2.5 p-2.5 rounded-lg',
                    'border border-dashed border-gray-300 dark:border-gray-600',
                    'bg-gray-50/50 dark:bg-gray-800/30'
                  )}>
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg',
                      'bg-[#5B50BD]/10 dark:bg-[#918AD3]/10'
                    )}>
                      {attachmentFormat === 'pdf' && <FileText className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />}
                      {attachmentFormat === 'doc' && <FileType className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />}
                      {attachmentFormat === 'pptx' && <Presentation className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        Meta Learnings Report.{attachmentFormat === 'doc' ? 'doc' : attachmentFormat === 'pptx' ? 'pptx' : 'pdf'}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        AI Insights • {Math.round(content.length / 100)}KB
                      </p>
                    </div>
                    <div className={cn(
                      'flex items-center justify-center w-5 h-5 rounded-full',
                      'bg-emerald-100 dark:bg-emerald-900/50'
                    )}>
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendEmail}
                  disabled={isSending || !emailTo.trim()}
                  className={cn(
                    'w-full h-8 text-xs gap-1.5',
                    'bg-[#5B50BD] hover:bg-[#4A41A0]',
                    'dark:bg-[#918AD3] dark:hover:bg-[#A8A2DE] dark:text-[#100E28]'
                  )}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Email
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
