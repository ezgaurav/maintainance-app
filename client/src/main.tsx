import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useAuthStore } from './store';
import { socketService } from './services/socket.service';

const token = localStorage.getItem('token');
if (token) {
  const user = localStorage.getItem('user');
  if (user) {
    useAuthStore.setState({
      token,
      user: JSON.parse(user),
      isAuthenticated: true,
    });
    socketService.connect(token);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
