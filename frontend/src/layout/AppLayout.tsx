import React from 'react';
import { ContactsPage } from '../contacts/ContactsPage.js';
import { CampaignsPage } from '../campaigns/CampaignsPage.js';

export function AppLayout() {
  return (
    <main>
      <nav>
        <a href="#contacts">Contacts</a>
        <a href="#campaigns">Campaigns</a>
      </nav>
      <section id="contacts">
        <ContactsPage />
      </section>
      <section id="campaigns">
        <CampaignsPage />
      </section>
    </main>
  );
}
