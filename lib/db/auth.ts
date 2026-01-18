import { createServerSupabaseClient } from '@/lib/supabase/server';

type Profile = {
  id: string;
  name: string | null;
  role: 'user' | 'admin';
};

export async function getUserAndProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', user.id)
      .single();

    if (data) {
      profile = data as Profile;
    }
  }

  return { supabase, user, profile };
}
