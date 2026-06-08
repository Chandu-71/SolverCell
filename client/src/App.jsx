import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Show } from '@clerk/react';

import useSocket from './hooks/useSocket';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Discover from './pages/Discover';
import Notifications from './pages/Notifications';
import CreateProblem from './pages/CreateProblem';
import Workspace from './pages/Workspace';
import Leaderboard from './pages/Leaderboard';

import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => (
  <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
    {children}
  </Show>
);

const PublicRoute = ({ children }) => (
  <Show when='signed-out' fallback={<Navigate to='/' replace />}>
    {children}
  </Show>
);

const App = () => {
  useSocket();

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route
        path='/login/*'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path='/register/*'
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* PROTECTED ROUTES */}
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path='/problem/:problemId'
        element={
          <ProtectedRoute>
            <Workspace />
          </ProtectedRoute>
        }
      />

      <Route
        path='/messages'
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path='/messages/:id'
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path='/discover'
        element={
          <ProtectedRoute>
            <Discover />
          </ProtectedRoute>
        }
      />

      <Route
        path='/notifications'
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path='/leaderboard'
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profile'
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path='/profile/:username'
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path='/create'
        element={
          <ProtectedRoute>
            <CreateProblem />
          </ProtectedRoute>
        }
      />

      {/* NOT FOUND */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default App;
