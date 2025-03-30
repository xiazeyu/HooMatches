import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (isRegistering) {
      if (credentials.password !== credentials.confirmPassword) {
        return setError('Passwords do not match');
      }
      if (!credentials.email.includes('@')) {
        return setError('Invalid email address');
      }
    }

    try {
      const endpoint = isRegistering
        ? 'https://workers-hoomatches.kkmk.workers.dev/register'
        : 'https://workers-hoomatches.kkmk.workers.dev/login';

      const raw = isRegistering
        ? JSON.stringify({
            username: credentials.username,
            email: credentials.email,
            password: credentials.password,
          })
        : JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          });

      const requestOptions = {
        method: 'POST',
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch(endpoint, requestOptions);

      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        if (responseData && responseData.message) {
          throw new Error(responseData.message);
        } else {
          throw new Error('Something went wrong');
        }
      }

      // Navigate only if the response indicates success
      navigate(`/profile?step=1&username=${credentials.username}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
  };

  return (
    <div className="auth-form">
      <h2>{isRegistering ? 'Create Account' : 'Welcome to HooMatches'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
            />
          </div>
        )}
        
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
          />
        </div>

        {isRegistering && (
          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              value={credentials.confirmPassword}
              onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
              required
            />
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit">
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>

      <div className="auth-toggle">
        {isRegistering ? 'Already have an account? ' : 'Need an account? '}
        <button type="button" onClick={toggleAuthMode}>
          {isRegistering ? 'Login here' : 'Register here'}
        </button>
      </div>
    </div>
  );
}