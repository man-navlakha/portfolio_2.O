"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';

export default function HireForm({ onClose, onSuccess }) {
  const [details, setDetails] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      if (res.ok) {
        setSent(true);
        setTimeout(() => { onSuccess(); }, 1500);
      }
    } catch (err) {
      console.error('Hire form error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-3 py-8"
      >
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="font-semibold text-slate-900 dark:text-white">Request Sent! 🎉</p>
        <p className="text-xs text-slate-500 dark:text-gray-400 text-center">Man will get back to you shortly.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-black/40 backdrop-blur-xl p-4 rounded-xl border border-white/25 dark:border-white/10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Project Inquiry</h4>
          <p className="text-[10px] text-slate-400">Man will respond within 24 hours</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text" placeholder="Your Name" required value={details.name}
          onChange={e => setDetails(d => ({ ...d, name: e.target.value }))}
          className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <input
          type="email" placeholder="Your Email" required value={details.email}
          onChange={e => setDetails(d => ({ ...d, email: e.target.value }))}
          className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <input
          type="text" placeholder="Subject" required value={details.subject}
          onChange={e => setDetails(d => ({ ...d, subject: e.target.value }))}
          className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <textarea
          placeholder="Tell Man about your project..." required rows={3}
          value={details.message}
          onChange={e => setDetails(d => ({ ...d, message: e.target.value }))}
          className="w-full p-2.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-brand resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : 'Send Request ✉️'}
        </button>
      </form>
    </div>
  );
}
