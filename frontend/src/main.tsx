import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppLayout } from './layout/AppLayout.js';

createRoot(document.getElementById('root') as HTMLElement).render(<AppLayout />);
