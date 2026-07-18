'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  MessageCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  Bell,
  Menu,
  X,
} from 'lucide-react';

// Portal context for sharing user data across portal pages
const PortalContext = createContext(null);
export const usePortal = () => useContext(PortalContext);

export default function PortalLayoutClient({ children }) {
  const pathname = usePathname();

  // Login page gets its own full-screen layout — no sidebar
  if (pathname === '/portal/login') {
    return <>{children}</>;
  }

  return <PortalShell>{children}</PortalShell>;
}

function PortalShell({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // Get unread message count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .neq('sender_id', user.id);
        setUnreadMessages(count || 0);
      }
      setLoading(false);
    };

    getUser();

    // Listen for realtime message updates for unread count
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.sender_id !== user?.id) {
            setUnreadMessages((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/portal/login');
    router.refresh();
  };

  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', href: '/portal', icon: LayoutDashboard },
    { name: 'Projects', href: '/portal/projects', icon: FolderKanban },
    { name: 'Documents', href: '/portal/documents', icon: FileText },
    ...(isAdmin ? [] : [{
      name: 'Chat',
      href: '/portal/chat',
      icon: MessageCircle,
      badge: unreadMessages > 0 ? unreadMessages : null,
    }]),
    { name: 'Settings', href: '/portal/settings', icon: Settings },
  ];

  const adminItems = [
    { name: 'Admin Panel', href: '/portal/admin', icon: Shield },
    { name: 'All Clients', href: '/portal/admin/clients', icon: Users },
    { 
      name: 'All Chats', 
      href: '/portal/admin/chat', 
      icon: MessageCircle,
      badge: unreadMessages > 0 ? unreadMessages : null 
    },
  ];

  const isActive = (href) => {
    if (href === '/portal') return pathname === '/portal';
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#30af5b]/30 border-t-[#30af5b] rounded-full"
        />
      </div>
    );
  }

  return (
    <PortalContext.Provider value={{ user, profile, isAdmin, supabase, unreadMessages, setUnreadMessages }}>
      <div className="min-h-screen bg-[#050508] flex">
        {/* Desktop Sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 72 : 260 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/[0.06]"
        >
          {/* Logo area */}
          <div className="flex items-center justify-between p-4 h-16 border-b border-white/[0.06]">
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#30af5b] to-[#25a34f] flex items-center justify-center text-white font-bold text-sm">
                    MN
                  </div>
                  <span className="text-white font-semibold text-sm tracking-tight">Client Portal</span>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-[#30af5b]/10 text-[#30af5b]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#30af5b] rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {/* Badge */}
                  {item.badge && (
                    <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-[#30af5b] text-white rounded-full`}>
                      {item.badge}
                    </span>
                  )}
                  {/* Tooltip for collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1a24] border border-white/[0.08] rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-xl">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}

            {/* Admin section */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  {!collapsed && (
                    <span className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                      Admin
                    </span>
                  )}
                  {collapsed && <div className="border-t border-white/[0.06] mx-2" />}
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-[#6366f1]/10 text-[#818cf8]'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="whitespace-nowrap"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {collapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#1a1a24] border border-white/[0.08] rounded-lg text-xs text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-xl">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User area */}
          <div className="p-3 border-t border-white/[0.06]">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#30af5b]/30 to-[#6366f1]/30 border border-white/[0.1] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium text-white truncate">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold text-sm">Portal</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all relative">
              <Bell className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#30af5b] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col"
              >
                <div className="flex items-center justify-between p-4 h-14 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#30af5b] to-[#25a34f] flex items-center justify-center text-white font-bold text-sm">
                      MN
                    </div>
                    <span className="text-white font-semibold text-sm">Client Portal</span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? 'bg-[#30af5b]/10 text-[#30af5b]'
                            : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold bg-[#30af5b] text-white rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                  {isAdmin && (
                    <>
                      <div className="pt-4 pb-2">
                        <span className="px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                          Admin
                        </span>
                      </div>
                      {adminItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              active
                                ? 'bg-[#6366f1]/10 text-[#818cf8]'
                                : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </nav>

                <div className="p-3 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3 p-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#30af5b]/30 to-[#6366f1]/30 border border-white/[0.1] flex items-center justify-center text-white text-xs font-bold">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'
          } mt-14 md:mt-0`}
        >
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </PortalContext.Provider>
  );
}
