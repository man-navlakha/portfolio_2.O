'use client';

import { useState, useEffect, useRef } from 'react';
import { usePortal } from '../PortalLayoutClient';
import DocumentCard from '@/components/portal/DocumentCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Upload,
  X,
  Loader2,
  CheckCircle,
  Filter,
} from 'lucide-react';

export default function DocumentsPage() {
  const { user, supabase, isAdmin } = usePortal();
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
    fetchProjects();
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    let query = supabase
      .from('documents')
      .select('*, project:client_projects(title)')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('client_id', user.id);
    }

    const { data } = await query;
    setDocuments(data || []);
    setLoading(false);
  };

  const fetchProjects = async () => {
    if (!user) return;

    let query = supabase.from('client_projects').select('id, title');
    if (!isAdmin) {
      query = query.eq('client_id', user.id);
    }

    const { data } = await query;
    setProjects(data || []);
  };

  const handleUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);

    let hasErrors = false;

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) continue; // 50MB limit

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('documents').getPublicUrl(fileName);

        // Determine file type
        let fileType = 'default';
        const ext = fileExt.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) fileType = 'image';
        else if (ext === 'pdf') fileType = 'pdf';
        else if (['doc', 'docx', 'txt', 'md'].includes(ext)) fileType = 'doc';
        else if (['xls', 'xlsx', 'csv'].includes(ext)) fileType = 'spreadsheet';
        else if (['fig', 'sketch', 'psd', 'ai', 'xd'].includes(ext)) fileType = 'design';

        const { data: newDoc, error: insertError } = await supabase.from('documents').insert({
          client_id: user.id,
          project_id: projectFilter !== 'all' ? projectFilter : null,
          name: file.name,
          file_url: publicUrl,
          file_type: fileType,
          file_size: file.size,
          uploaded_by: user.id,
        }).select().single();

        if (insertError) {
          console.error("Document insert error:", insertError);
          hasErrors = true;
        }
      } else {
        console.error("Storage upload error:", uploadError);
        hasErrors = true;
      }
    }

    setUploading(false);
    if (!hasErrors) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } else {
      alert("There was an error uploading one or more files. Check the console for details.");
    }
    fetchDocuments();
  };

  const handleDelete = async (docId) => {
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    if (!error) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchesProject = projectFilter === 'all' || d.project_id === projectFilter;
    return matchesSearch && matchesProject;
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white font-primary tracking-tight">Documents</h1>
        <p className="text-gray-500 text-sm mt-1">
          All your shared files, contracts, and project documents.
        </p>
      </motion.div>

      {/* Upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`relative border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-[#30af5b] bg-[#30af5b]/5'
            : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(Array.from(e.target.files))}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.csv,.fig,.sketch,.psd,.ai,.xd,.zip"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-[#30af5b] animate-spin mb-2" />
            <p className="text-sm text-gray-400">Uploading...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-8 h-8 text-[#30af5b] mb-2" />
            <p className="text-sm text-[#30af5b]">Upload complete!</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-500 mb-3" />
            <p className="text-sm text-gray-400">
              <span className="text-[#30af5b] font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-600 mt-1">PDF, Images, Docs, Spreadsheets up to 50MB</p>
          </div>
        )}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#30af5b]/40 transition-all"
          />
        </div>

        {projects.length > 0 && (
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-gray-400 focus:outline-none focus:border-[#30af5b]/40 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-16 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">
            {search || projectFilter !== 'all' ? 'No matching documents' : 'No documents yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {search || projectFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Upload files above or wait for your developer to share documents.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map((doc, i) => (
            <DocumentCard
              key={doc.id}
              document={{ ...doc, project_title: doc.project?.title }}
              index={i}
              onDelete={handleDelete}
              showProject={projectFilter === 'all'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
