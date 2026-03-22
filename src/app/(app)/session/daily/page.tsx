import { DailySessionFlow } from '@/features/training/components/DailySessionFlow';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DailySessionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { data: profile } = await supabase
    .from('reading_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (!profile) {
    redirect('/diagnostic');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DailySessionFlow profile={profile} />
    </div>
  );
}
