import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error('Missing Publishable Key');

createRoot(document.getElementById('root')).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    afterSignOutUrl='/'
    appearance={{
      cssLayerName: 'clerk',
      elements: {
        // ── Hide the profile/name/avatar section in the Account Settings modal
        profileSection__profile: { display: 'none' },
        profileSectionContent__profile: { display: 'none' },
        profileSection__username: { display: 'none' },
      },
    }}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
);
