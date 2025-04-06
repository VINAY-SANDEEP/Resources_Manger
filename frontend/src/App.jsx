import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminPanel from './adminpanel'
import StudentPanel from './studentpanel'

function LoginPage() {
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: ''
  });

  const [studentForm, setStudentForm] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: adminForm.username,
          password: adminForm.password,
          role: 'admin'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      setSuccess(`Welcome, ${data.user.username}!`);
      setIsAuthenticated(true);
      setUserRole('admin');
      setAdminForm({ username: '', password: '' });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: studentForm.username,
          password: studentForm.password,
          role: 'student'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      setSuccess(`Welcome, ${data.user.username}!`);
      setIsAuthenticated(true);
      setUserRole('student');
      setStudentForm({ username: '', password: '' });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (isAuthenticated && userRole === 'student') {
    return <Navigate to="/student" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-light text-center text-indigo-900 mb-12 tracking-wide">Login Portal</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Admin Login Form */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border-t-4 border-indigo-500 transform hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-xl font-normal text-center text-indigo-800 mb-8 tracking-wide">Admin Login</h2>
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div>
                <label htmlFor="admin-username" className="block text-sm font-normal text-indigo-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="admin-username"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                  className="w-full px-4 py-2 bg-white/50 border border-indigo-200 rounded focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-normal text-indigo-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="admin-password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                  className="w-full px-4 py-2 bg-white/50 border border-indigo-200 rounded focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 px-4 rounded hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-md hover:shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Admin Login'}
              </button>
            </form>
          </div>

          {/* Student Login Form */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border-t-4 border-purple-500 transform hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-xl font-normal text-center text-purple-800 mb-8 tracking-wide">Student Login</h2>
            <form onSubmit={handleStudentSubmit} className="space-y-6">
              <div>
                <label htmlFor="student-username" className="block text-sm font-normal text-purple-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="student-username"
                  value={studentForm.username}
                  onChange={(e) => setStudentForm({...studentForm, username: e.target.value})}
                  className="w-full px-4 py-2 bg-white/50 border border-purple-200 rounded focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="student-password" className="block text-sm font-normal text-purple-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="student-password"
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                  className="w-full px-4 py-2 bg-white/50 border border-purple-200 rounded focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Student Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/student" element={<StudentPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
