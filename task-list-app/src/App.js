
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { GlobalDataProvider } from './context/GlobalDataProvider';
import Task from './pages/Task';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './auth/Login';
import ProtectedRoute from './auth/ProtectedRoute';
import secureLocalStorage from "react-secure-storage";
import { useState, useEffect } from 'react';

function App() {
  const queryCLient = new QueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkUserToken = () => {
    const userToken = secureLocalStorage.getItem('accessToken');
    if (userToken && userToken !== 'undefined') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }

  useEffect(() => {
    checkUserToken();
  }, [isLoggedIn]);
  return (
    <GlobalDataProvider>
      <QueryClientProvider client={queryCLient}>
        <Router>
          <Routes>
            <Route index element={<Login />} />
            <Route path="/" element={<Login />} />
            <Route 
              path="/tasks" 
              element={
                  <ProtectedRoute isLoggedIn={isLoggedIn}>
                      <Task />
                  </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </QueryClientProvider>
    </GlobalDataProvider>
  );
}

export default App;
