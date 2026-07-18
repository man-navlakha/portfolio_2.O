'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  FileCode,
  Download,
  Eye,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { useState } from 'react';

const typeConfig = {
  pdf: { icon: FileText, color: '#ef4444', label: 'PDF' },
  image: { icon: Image, color: '#3b82f6', label: 'Image' },
  doc: { icon: FileText, color: '#2563eb', label: 'Document' },
  spreadsheet: { icon: FileSpreadsheet, color: '#22c55e', label: 'Spreadsheet' },
  code: { icon: FileCode, color: '#a78bfa', label: 'Code' },
  design: { icon: Image, color: '#f59e0b', label: 'Design' },
  invoice: { icon: FileText, color: '#30af5b', label: 'Invoice' },
  contract: { icon: FileText, color: '#ec4899', label: 'Contract' },
  default: { icon: File, color: '#6b7280', label: 'File' },
};

function getFileType(fileType, fileName) {
  if (fileType && typeConfig[fileType]) return typeConfig[fileType];
  // Guess from extension
  const ext = fileName?.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return typeConfig.image;
  if (ext === 'pdf') return typeConfig.pdf;
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) return typeConfig.doc;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return typeConfig.spreadsheet;
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css'].includes(ext)) return typeConfig.code;
  if (['fig', 'sketch', 'psd', 'ai', 'xd'].includes(ext)) return typeConfig.design;
  return typeConfig.default;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({ document, index = 0, onDelete, showProject = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const config = getFileType(document.file_type, document.name);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-[#0d0d14]/80 backdrop-blur-sm border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        {/* File icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{document.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              {config.label}
            </span>
            {document.file_size && (
              <span className="text-[11px] text-gray-600">
                {formatFileSize(document.file_size)}
              </span>
            )}
            <span className="text-[11px] text-gray-600">
              {new Date(document.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          {showProject && document.project_title && (
            <p className="text-[11px] text-gray-500 mt-1 truncate">
              📂 {document.project_title}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {document.file_url && (
            <>
              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </a>
              <a
                href={document.file_url}
                download
                className="p-1.5 rounded-lg text-gray-500 hover:text-[#30af5b] hover:bg-[#30af5b]/10 transition-all"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(document.id)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
