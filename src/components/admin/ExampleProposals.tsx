'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Search,
  FileText,
  Trash2,
  Eye,
  Download,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ExampleProposal {
  id: string;
  name: string;
  fileName: string;
  category: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: string;
  status: 'processing' | 'ready' | 'error';
  description?: string;
}

// Mock data
const mockExamples: ExampleProposal[] = [
  {
    id: '1',
    name: 'Consumer Insights Study',
    fileName: 'consumer_insights_q4_2024.pdf',
    category: 'Market Research',
    uploadedBy: 'John Doe',
    uploadedAt: new Date(Date.now() - 86400000),
    size: '2.4 MB',
    status: 'ready',
    description: 'Comprehensive consumer behavior analysis for retail sector',
  },
  {
    id: '2',
    name: 'Brand Awareness Survey',
    fileName: 'brand_awareness_report.pdf',
    category: 'Brand Research',
    uploadedBy: 'Jane Smith',
    uploadedAt: new Date(Date.now() - 172800000),
    size: '1.8 MB',
    status: 'ready',
    description: 'Multi-channel brand perception study',
  },
  {
    id: '3',
    name: 'Product Testing Results',
    fileName: 'product_test_analysis.docx',
    category: 'Product Research',
    uploadedBy: 'Mike Brown',
    uploadedAt: new Date(Date.now() - 259200000),
    size: '3.2 MB',
    status: 'ready',
    description: 'Blind taste test results and recommendations',
  },
  {
    id: '4',
    name: 'Customer Satisfaction Report',
    fileName: 'csat_q3_2024.pdf',
    category: 'Customer Experience',
    uploadedBy: 'Sarah Wilson',
    uploadedAt: new Date(Date.now() - 3600000),
    size: '1.5 MB',
    status: 'processing',
    description: 'Quarterly CSAT and NPS analysis',
  },
  {
    id: '5',
    name: 'Pricing Strategy Analysis',
    fileName: 'pricing_research.pdf',
    category: 'Pricing Research',
    uploadedBy: 'Emily Davis',
    uploadedAt: new Date(Date.now() - 604800000),
    size: '2.1 MB',
    status: 'error',
    description: 'Van Westendorp and Gabor-Granger analysis',
  },
];

const categories = [
  'All Categories',
  'Market Research',
  'Brand Research',
  'Product Research',
  'Customer Experience',
  'Pricing Research',
  'Ad Testing',
  'Concept Testing',
];

export function ExampleProposals() {
  const [examples, setExamples] = useState<ExampleProposal[]>(mockExamples);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [newExample, setNewExample] = useState({ name: '', category: 'Market Research', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter examples
  const filteredExamples = examples.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ex.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ex.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadingFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (uploadingFiles.length > 0 && newExample.name) {
      const newExampleProposal: ExampleProposal = {
        id: String(Date.now()),
        name: newExample.name,
        fileName: uploadingFiles[0].name,
        category: newExample.category,
        uploadedBy: 'Current User',
        uploadedAt: new Date(),
        size: `${(uploadingFiles[0].size / 1024 / 1024).toFixed(1)} MB`,
        status: 'processing',
        description: newExample.description,
      };
      setExamples([newExampleProposal, ...examples]);
      setShowUploadModal(false);
      setUploadingFiles([]);
      setNewExample({ name: '', category: 'Market Research', description: '' });
    }
  };

  const handleDelete = (id: string) => {
    setExamples(examples.filter(ex => ex.id !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusIcon = (status: ExampleProposal['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: ExampleProposal['status']) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 rounded-full border-2 border-[#5B50BD] dark:border-[#918AD3]" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Example Proposals</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
            Upload and manage example proposals for RAG-enhanced generation
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Upload New Example</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add proposal documents to improve AI-generated content
                </p>
              </div>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-[#5B50BD] hover:bg-[#4a41a0] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {/* Quick Upload Zone */}
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                dragActive
                  ? 'border-[#5B50BD] bg-[#EDE9F9] dark:bg-[#231E51]'
                  : 'border-gray-300 dark:border-gray-600 hover:border-[#5B50BD] dark:hover:border-[#918AD3]'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Drag and drop files here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#5B50BD] dark:text-[#918AD3] font-medium hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Supports PDF, DOCX, and TXT files (max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search examples..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Examples List */}
        <Card>
          <CardContent className="p-0">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Uploaded Examples ({filteredExamples.length})
              </h3>
            </div>
            {filteredExamples.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No examples found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Upload your first example proposal to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredExamples.map((example) => (
                  <div
                    key={example.id}
                    className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#EDE9F9] dark:bg-[#231E51] rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#5B50BD] dark:text-[#918AD3]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">{example.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{example.fileName}</p>
                        {example.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{example.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                          {example.category}
                        </span>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {example.size} • {formatDate(example.uploadedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
                          example.status === 'ready' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                          example.status === 'processing' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                          example.status === 'error' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        )}>
                          {getStatusIcon(example.status)}
                          {getStatusLabel(example.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(example.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upload Example Proposal</h3>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadingFiles([]);
                      setNewExample({ name: '', category: 'Market Research', description: '' });
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* File Upload Area */}
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors',
                    dragActive
                      ? 'border-[#5B50BD] bg-[#EDE9F9] dark:bg-[#231E51]'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadingFiles.length > 0 ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-[#5B50BD] dark:text-[#918AD3]" />
                      <div className="text-left">
                        <p className="font-medium text-gray-800 dark:text-white">{uploadingFiles[0].name}</p>
                        <p className="text-sm text-gray-500">{(uploadingFiles[0].size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => setUploadingFiles([])}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Drop your file here or{' '}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#5B50BD] dark:text-[#918AD3] font-medium"
                        >
                          browse
                        </button>
                      </p>
                    </>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Example Name *
                    </label>
                    <input
                      type="text"
                      value={newExample.name}
                      onChange={(e) => setNewExample({ ...newExample, name: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      placeholder="Enter a descriptive name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newExample.category}
                      onChange={(e) => setNewExample({ ...newExample, category: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                    >
                      {categories.filter(c => c !== 'All Categories').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      value={newExample.description}
                      onChange={(e) => setNewExample({ ...newExample, description: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD] resize-none"
                      placeholder="Brief description of the proposal content"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadingFiles([]);
                      setNewExample({ name: '', category: 'Market Research', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!uploadingFiles.length || !newExample.name}
                    className="bg-[#5B50BD] hover:bg-[#4a41a0] text-white disabled:opacity-50"
                  >
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
