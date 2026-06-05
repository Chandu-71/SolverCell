import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/react';

import App from './App.jsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) throw new Error('Missing Publishable Key');

const clerkAppearance = {
  cssLayerName: 'clerk',
  elements: {
    profileSection__profile: {
      display: 'none',
    },
    profileSectionContent__profile: {
      display: 'none',
    },
    profileSection__username: {
      display: 'none',
    },
  },
};

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/' appearance={clerkAppearance}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
);
