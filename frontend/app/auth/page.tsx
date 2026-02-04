'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

type Tab = 'login' | 'signup';
type Role = 'student' | 'teacher';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { 
    loading, 
    error, 
    studentLogin, 
    teacherLogin, 
    studentSignup, 
    teacherSignup 
  } = useAuth();

  const [tab, setTab] = useState<Tab>('login');
  const [role, setRole] = useState<Role>('student');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    roll_number: '',
    batch: '',
    academic_session: '',
    department: ''
  });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'student' || roleParam === 'teacher') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (role === 'student') {
        await studentLogin(loginData.email, loginData.password);
        showToast('Login successful!', 'success');
        router.push('/student');
      } else {
        await teacherLogin(loginData.email, loginData.password);
        showToast('Login successful!', 'success');
        router.push('/teacher');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (role === 'student') {
        await studentSignup({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          roll_number: signupData.roll_number,
          batch: signupData.batch,
          academic_session: signupData.academic_session
        });
        showToast('Signup successful!', 'success');
        router.push('/student');
      } else {
        await teacherSignup({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          department: signupData.department
        });
        showToast('Signup successful!', 'success');
        router.push('/teacher');
      }
    } catch (err: any) {
      showToast(err.message || 'Signup failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {role === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'}
        </h1>
        <p className="text-gray-600 mb-6">
          {tab === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-md transition-all ${
              tab === 'login'
                ? 'bg-white shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`flex-1 py-2 rounded-md transition-all ${
              tab === 'signup'
                ? 'bg-white shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Signup
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === 'student'}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mr-2"
              />
              <span>Student</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={role === 'teacher'}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mr-2"
              />
              <span>Teacher</span>
            </label>
          </div>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="••••••••"
              />
            </div>

            {role === 'student' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.roll_number}
                    onChange={(e) => setSignupData({ ...signupData, roll_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="CS2024001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.batch}
                    onChange={(e) => setSignupData({ ...signupData, batch: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    required
                    value={signupData.academic_session}
                    onChange={(e) => setSignupData({ ...signupData, academic_session: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="2024-2025"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={signupData.department}
                  onChange={(e) => setSignupData({ ...signupData, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Computer Science"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
