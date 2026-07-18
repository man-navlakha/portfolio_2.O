import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a conversation for a client
export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role to bypass RLS and find the admin
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Find the admin user
    const { data: adminUser } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'No admin found in the system' }, { status: 400 });
    }

    // 2. Check if a conversation already exists
    const { data: existingConv } = await adminSupabase
      .from('conversations')
      .select('*')
      .eq('client_id', user.id)
      .eq('admin_id', adminUser.id)
      .limit(1)
      .single();

    if (existingConv) {
      return NextResponse.json(existingConv);
    }

    // 3. Create the conversation if it doesn't exist
    const { data: newConv, error } = await adminSupabase
      .from('conversations')
      .insert({
        client_id: user.id,
        admin_id: adminUser.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newConv);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
