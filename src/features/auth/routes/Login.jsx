import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import Card from '../../../components/common/Card/Card';

const Login = () => {
  const { login, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (email, password) => {
    setIsLoading(true);
    try {
      await login(email, password);
      // Redirect is handled by AuthLayout when user state changes
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card title="Login to Portal Berita" className="auth-card">
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;