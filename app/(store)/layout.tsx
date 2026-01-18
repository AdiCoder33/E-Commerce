import { ReactNode } from 'react';
import AnnouncementBar from '@/components/layout/announcement-bar';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import MiniCartDrawer from '@/components/layout/mini-cart-drawer';
import SearchOverlay from '@/components/layout/search-overlay';
import StoreProvider from '@/components/layout/store-provider';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  const { data: settings } = await supabase
    .from('site_settings')
    .select('store_name, tagline, announcement, about_md, support_email, support_phone')
    .single();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <StoreProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#f7f2e9_60%,_#efe7da_100%)]">
        <AnnouncementBar announcement={settings?.announcement} />
        <Header
          categories={categories || []}
          userEmail={user?.email}
          storeName={settings?.store_name}
        />
        <SearchOverlay categories={categories || []} />
        <MiniCartDrawer />
        {children}
        <Footer categories={categories || []} settings={settings} />
      </div>
    </StoreProvider>
  );
}
