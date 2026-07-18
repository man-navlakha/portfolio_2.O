'use client';

import { useState, useEffect } from 'react';
import { usePortal } from '../../PortalLayoutClient';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Mail,
  Lock,
  Building2,
  User,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  FolderKanban,
  Plus,
  Key,
} from 'lucide-react';

export default function ClientsPage() {
  const { user, profile, supabase, isAdmin } = usePortal();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New client form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // New project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectClientId, setProjectClientId] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectTechStack, setProjectTechStack] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  // Reset password state
  const [resetPasswordClient, setResetPasswordClient] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Team Member state
  const [teamMemberClient, setTeamMemberClient] = useState(null);
  const [teamEmail, setTeamEmail] = useState('');
  const [teamPassword, setTeamPassword] = useState('');
  const [teamFullName, setTeamFullName] = useState('');
  const [creatingTeamMember, setCreatingTeamMember] = useState(false);
  const [teamError, setTeamError] = useState('');
  const [teamSuccess, setTeamSuccess] = useState('');

  useEffect(() => {
    if (profile && !isAdmin) {
      router.push('/portal');
      return;
    }
    if (isAdmin) fetchClients();
  }, [isAdmin, profile]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, client_projects(id, title, status, progress)')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
    setClients(data || []);
    setLoading(false);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormError('');
    setFormSuccess('');

    try {
      // Use the API route to create the user (needs service role key)
      const res = await fetch('/api/portal/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, company }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to create client');
      } else {
        setFormSuccess(`Client "${fullName}" created successfully!`);
        setEmail('');
        setPassword('');
        setFullName('');
        setCompany('');
        setTimeout(() => {
          setShowForm(false);
          setFormSuccess('');
          fetchClients();
        }, 2000);
      }
    } catch (err) {
      setFormError('Failed to create client');
    }

    setCreating(false);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreatingProject(true);

    const { error } = await supabase.from('client_projects').insert({
      client_id: projectClientId,
      title: projectTitle,
      description: projectDesc,
      tech_stack: projectTechStack.split(',').map((t) => t.trim()).filter(Boolean),
      deadline: projectDeadline || null,
      status: 'planning',
      progress: 0,
      start_date: new Date().toISOString(),
    });

    if (!error) {
      setShowProjectForm(false);
      setProjectTitle('');
      setProjectDesc('');
      setProjectTechStack('');
      setProjectDeadline('');
      setProjectClientId('');
      fetchClients();
    }

    setCreatingProject(false);
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Are you sure? This will remove the client profile.')) return;
    await supabase.from('profiles').delete().eq('id', clientId);
    fetchClients();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResettingPassword(true);
    setResetError('');
    setResetSuccess('');

    try {
      const res = await fetch('/api/portal/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetPasswordClient.id, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.error || 'Failed to update password');
      } else {
        setResetSuccess('Password updated successfully!');
        setNewPassword('');
        setTimeout(() => {
          setResetPasswordClient(null);
          setResetSuccess('');
        }, 2000);
      }
    } catch (err) {
      setResetError('Failed to update password');
    }

    setResettingPassword(false);
  };

  const handleCreateTeamMember = async (e) => {
    e.preventDefault();
    setCreatingTeamMember(true);
    setTeamError('');
    setTeamSuccess('');

    try {
      const res = await fetch('/api/portal/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: teamEmail,
          password: teamPassword,
          fullName: teamFullName,
          company: teamMemberClient.company, // Inherit company
          parentClientId: teamMemberClient.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTeamError(data.error || 'Failed to create team member');
      } else {
        setTeamSuccess(`Team member "${teamFullName}" created successfully!`);
        setTeamEmail('');
        setTeamPassword('');
        setTeamFullName('');
        setTimeout(() => {
          setTeamMemberClient(null);
          setTeamSuccess('');
          fetchClients();
        }, 2000);
      }
    } catch (err) {
      setTeamError('Failed to create team member');
    }

    setCreatingTeamMember(false);
  };

  if (!isAdmin) return null;

  const primaryClients = clients.filter(c => !c.parent_client_id);
  const getTeamMembers = (parentId) => clients.filter(c => c.parent_client_id === parentId);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-primary tracking-tight">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage client accounts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowProjectForm(true); setShowForm(false); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#30af5b]/10 hover:bg-[#30af5b]/20 text-[#30af5b] text-sm font-medium rounded-xl border border-[#30af5b]/20 transition-colors"
          >
            <FolderKanban className="w-4 h-4" />
            New Project
          </button>
          <button
            onClick={() => { setShowForm(true); setShowProjectForm(false); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#818cf8]/10 hover:bg-[#818cf8]/20 text-[#818cf8] text-sm font-medium rounded-xl border border-[#818cf8]/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            New Client
          </button>
        </div>
      </motion.div>

      {/* Create Client Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-[#0d0d14]/80 border border-[#818cf8]/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#818cf8]" />
                  Create New Client Account
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleCreateClient} className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#818cf8]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" /> Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#818cf8]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="client@example.com"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#818cf8]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#818cf8]/40 transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#818cf8] hover:bg-[#6366f1] text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Create Client
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Project Form */}
      <AnimatePresence>
        {showProjectForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-[#0d0d14]/80 border border-[#30af5b]/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-[#30af5b]" />
                  Create New Project
                </h3>
                <button onClick={() => setShowProjectForm(false)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Assign to Client
                  </label>
                  <select
                    value={projectClientId}
                    onChange={(e) => setProjectClientId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#30af5b]/40 transition-all"
                  >
                    <option value="">Select a client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name || c.id} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    required
                    placeholder="E-commerce Website"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#30af5b]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={projectDeadline}
                    onChange={(e) => setProjectDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-[#30af5b]/40 transition-all"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Brief project description..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#30af5b]/40 transition-all resize-none"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={projectTechStack}
                    onChange={(e) => setProjectTechStack(e.target.value)}
                    placeholder="React, Node.js, PostgreSQL"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#30af5b]/40 transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={creatingProject}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#30af5b] hover:bg-[#38c466] text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {creatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetPasswordClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0d0d14] border border-[#818cf8]/20 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  Change Password for {resetPasswordClient.full_name}
                </h3>
                <button onClick={() => setResetPasswordClient(null)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {resetError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {resetError}
                </div>
              )}
              {resetSuccess && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {resetSuccess}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/40 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium rounded-xl border border-amber-500/20 transition-colors disabled:opacity-50"
                >
                  {resettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Team Member Modal */}
      <AnimatePresence>
        {teamMemberClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0d0d14] border border-[#818cf8]/20 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#818cf8]" />
                  Add Team Member to {teamMemberClient.company || teamMemberClient.full_name}
                </h3>
                <button onClick={() => setTeamMemberClient(null)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {teamError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {teamError}
                </div>
              )}
              {teamSuccess && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {teamSuccess}
                </div>
              )}

              <form onSubmit={handleCreateTeamMember} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={teamFullName}
                    onChange={(e) => setTeamFullName(e.target.value)}
                    required
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#818cf8]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={teamEmail}
                    onChange={(e) => setTeamEmail(e.target.value)}
                    required
                    placeholder="team@example.com"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#818cf8]/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="text"
                    value={teamPassword}
                    onChange={(e) => setTeamPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#818cf8]/40 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingTeamMember}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#818cf8] hover:bg-[#6366f1] text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {creatingTeamMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Add Team Member
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clients list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : primaryClients.length === 0 ? (
        <div className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl p-16 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No clients yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first client account to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#818cf8]/10 text-[#818cf8] text-sm font-medium rounded-xl border border-[#818cf8]/20 hover:bg-[#818cf8]/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create Client
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {primaryClients.map((client, i) => {
            const team = getTeamMembers(client.id);
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#0d0d14]/80 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] transition-all"
              >
                {/* Primary Client Row */}
                <div className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#818cf8]/20 to-[#6366f1]/20 border border-white/[0.08] flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{client.full_name || 'Unnamed'}</h3>
                      {client.company && (
                        <span className="text-[11px] text-gray-600">· {client.company}</span>
                      )}
                      <span className="px-2 py-0.5 bg-white/[0.06] text-gray-400 text-[10px] rounded uppercase tracking-wider font-semibold">
                        Owner
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Joined {new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    {/* Project pills */}
                    {client.client_projects?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {client.client_projects.map((proj) => (
                          <span
                            key={proj.id}
                            className="px-2 py-0.5 bg-[#30af5b]/10 text-[#30af5b] rounded-md text-[10px] font-medium"
                          >
                            {proj.title} ({proj.progress || 0}%)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTeamMemberClient(client);
                        setTeamEmail('');
                        setTeamPassword('');
                        setTeamFullName('');
                        setTeamError('');
                        setTeamSuccess('');
                      }}
                      className="p-2 rounded-lg text-gray-600 hover:text-[#818cf8] hover:bg-[#818cf8]/10 transition-all"
                      title="Add Team Member"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setResetPasswordClient(client);
                        setNewPassword('');
                        setResetError('');
                        setResetSuccess('');
                      }}
                      className="p-2 rounded-lg text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                      title="Change Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Remove client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Team Members List */}
                {team.length > 0 && (
                  <div className="border-t border-white/[0.04] bg-[#050508]/50 p-4 pl-16">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Team Members</h4>
                    <div className="space-y-3">
                      {team.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-gray-400">
                              {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-300">{member.full_name || 'Unnamed'}</p>
                              <p className="text-[11px] text-gray-600">Added {new Date(member.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setResetPasswordClient(member);
                                setNewPassword('');
                                setResetError('');
                                setResetSuccess('');
                              }}
                              className="p-1.5 rounded-md text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                              title="Change Password"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(member.id)}
                              className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Remove team member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
