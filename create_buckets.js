const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function create() {
  console.log("Creating documents bucket...");
  const { data: d1, error: e1 } = await supabase.storage.createBucket('documents', { public: true });
  console.log("Documents bucket:", d1, e1);
  
  console.log("Creating chat-attachments bucket...");
  const { data: d2, error: e2 } = await supabase.storage.createBucket('chat-attachments', { public: true });
  console.log("Chat bucket:", d2, e2);
}
create();
