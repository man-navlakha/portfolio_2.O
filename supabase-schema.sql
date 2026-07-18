-- ============================================================
-- Client Portal Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  parent_client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Client Projects
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  deadline DATE,
  tech_stack TEXT[],
  live_url TEXT,
  repo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES client_projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ── PROFILES ──────────────────────────────────────────────────
-- Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin(auth.uid()));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only service role can insert (handled by API route)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Admins can delete client profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin(auth.uid()));

-- ── CLIENT PROJECTS ───────────────────────────────────────────
-- Clients see their own projects, admin sees all, and team members see their parent's projects
CREATE POLICY "View own projects or admin"
  ON client_projects FOR SELECT
  USING (
    client_id = auth.uid() OR 
    client_id = (SELECT parent_client_id FROM profiles WHERE id = auth.uid()) OR 
    is_admin(auth.uid())
  );

-- Admins can insert projects
CREATE POLICY "Admins can create projects"
  ON client_projects FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Admins can update projects
CREATE POLICY "Admins can update projects"
  ON client_projects FOR UPDATE
  USING (is_admin(auth.uid()));

-- Admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON client_projects FOR DELETE
  USING (is_admin(auth.uid()));

-- ── DOCUMENTS ─────────────────────────────────────────────────
-- Clients see their own docs, admins see all, and team members see their parent's docs
CREATE POLICY "View own documents or admin"
  ON documents FOR SELECT
  USING (
    client_id = auth.uid() OR 
    client_id = (SELECT parent_client_id FROM profiles WHERE id = auth.uid()) OR 
    is_admin(auth.uid())
  );

-- Both clients and admins can upload documents
CREATE POLICY "Users can insert documents"
  ON documents FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

-- Admins can delete any document, clients can delete their own uploads
CREATE POLICY "Delete own documents or admin"
  ON documents FOR DELETE
  USING (uploaded_by = auth.uid() OR is_admin(auth.uid()));

-- ── CONVERSATIONS ─────────────────────────────────────────────
-- Clients see their own conversations, admins see all, and team members see their parent's conversations
CREATE POLICY "View own conversations or admin"
  ON conversations FOR SELECT
  USING (
    client_id = auth.uid() OR 
    client_id = (SELECT parent_client_id FROM profiles WHERE id = auth.uid()) OR 
    admin_id = auth.uid() OR 
    is_admin(auth.uid())
  );

-- Clients can create conversations for themselves or their parent client
CREATE POLICY "Clients can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    client_id = auth.uid() OR 
    client_id = (SELECT parent_client_id FROM profiles WHERE id = auth.uid())
  );

-- Both can update (for last_message_at)
CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (
    client_id = auth.uid() OR 
    client_id = (SELECT parent_client_id FROM profiles WHERE id = auth.uid()) OR 
    admin_id = auth.uid() OR 
    is_admin(auth.uid())
  );

-- ── MESSAGES ──────────────────────────────────────────────────
-- Users can read messages in their conversations
CREATE POLICY "Read messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.client_id = auth.uid() OR 
        conversations.client_id = (SELECT parent_client_id FROM profiles WHERE id = auth.uid()) OR 
        conversations.admin_id = auth.uid() OR 
        is_admin(auth.uid())
      )
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Send messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (
        conversations.client_id = auth.uid() OR 
        conversations.client_id = (SELECT parent_client_id FROM profiles WHERE id = auth.uid()) OR 
        conversations.admin_id = auth.uid() OR 
        is_admin(auth.uid())
      )
    )
  );

-- Users can update messages (for is_read)
CREATE POLICY "Update messages read status"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.client_id = auth.uid() OR 
        conversations.client_id = (SELECT parent_client_id FROM profiles WHERE id = auth.uid()) OR 
        conversations.admin_id = auth.uid() OR 
        is_admin(auth.uid())
      )
    )
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- REALTIME: Enable for messages and conversations
-- ============================================================
-- Go to Supabase Dashboard → Database → Replication
-- Enable the following tables for Realtime:
--   - messages
--   - conversations
-- 
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Create these buckets in Supabase Dashboard → Storage:
-- 1. "documents" - for shared project files
-- 2. "chat-attachments" - for files sent in chat
--
-- Set both to PUBLIC if you want direct URL access,
-- or PRIVATE with signed URLs for more security.

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER client_projects_updated_at
  BEFORE UPDATE ON client_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
