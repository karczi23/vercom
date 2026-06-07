import React, { useMemo, useState } from 'react';
import { ApiClient } from '../api/client.js';
import { getAuthState, type AuthState } from '../auth/authStore.js';
import { LoginForm } from '../auth/LoginForm.js';
import { ContactsPage } from '../contacts/ContactsPage.js';
import { CampaignsPage } from '../campaigns/CampaignsPage.js';
import { CampaignEditorPage } from '../campaign-editor/CampaignEditorPage.js';

export function AppLayout() {
  const [auth, setAuth] = useState<AuthState>(getAuthState());
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>();
  const client = useMemo(() => new ApiClient({ getToken: () => auth.accessToken }), [auth.accessToken]);

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Vercom</p>
            <h1 className="text-2xl font-semibold text-slate-950">Mailing Campaigns</h1>
          </div>
          <nav className="flex gap-2">
            <a className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="#contacts">Contacts</a>
            <a className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="#campaigns">Campaigns</a>
          </nav>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[320px_1fr]">
        <aside>
          <LoginForm onAuthenticated={setAuth} />
          {auth.username ? <p className="mt-3 text-sm text-slate-600">Signed in as <span className="font-medium">{auth.username}</span></p> : null}
        </aside>
        <div className="grid gap-6">
          <section id="contacts">
            <ContactsPage client={client} />
          </section>
          <section id="campaigns">
            <CampaignsPage client={client} onEditCampaign={setSelectedCampaignId} />
          </section>
          {selectedCampaignId ? (
            <section id="campaign-editor">
              <CampaignEditorPage campaignId={selectedCampaignId} client={client} />
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
