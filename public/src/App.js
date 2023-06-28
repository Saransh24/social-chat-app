import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import ChatPage from './pages/Chat';
import SetAvatarPage from './pages/SetAvatar';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setAvatar" element={<SetAvatarPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
