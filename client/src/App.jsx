import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Show, useAuth } from '@clerk/react';

import SyncUser from './components/SyncUser';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Discover from './pages/Discover';
import Notifications from './pages/Notifications';
import CreateProblem from './pages/CreateProblem';
import Workspace from './pages/Workspace';

import NotFound from './pages/NotFound';
import Loading from './components/Loading';

import useSocket from './hooks/useSocket';

const App = () => {
  const { isLoaded } = useAuth();
  useSocket(); // initialize global socket connection

  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <>
      <SyncUser /> {/* background sync */}
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path='/login/*'
          element={
            <Show when='signed-out' fallback={<Navigate to='/' replace />}>
              <Login />
            </Show>
          }
        />

        <Route
          path='/register/*'
          element={
            <Show when='signed-out' fallback={<Navigate to='/' replace />}>
              <Register />
            </Show>
          }
        />

        {/* PROTECTED ROUTES */}
        <Route
          path='/'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <Home />
            </Show>
          }
        />

        <Route
          path='/problem/:problemId'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <Workspace />
            </Show>
          }
        />

        <Route
          path='/messages'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <Messages />
            </Show>
          }
        />

        <Route
          path='/messages/:id'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <Messages />
            </Show>
          }
        />

        <Route
          path='/discover'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <Discover />
            </Show>
          }
        />

        <Route
          path='/notifications'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <Notifications />
            </Show>
          }
        />

        <Route
          path='/profile'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <Profile />
            </Show>
          }
        />

        <Route
          path='/profile/:username'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <Profile />
            </Show>
          }
        />

        <Route
          path='/create'
          element={
            <Show when='signed-in' fallback={<Navigate to='/login' replace />}>
              <CreateProblem />
            </Show>
          }
        />

        {/* NOT FOUND */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
