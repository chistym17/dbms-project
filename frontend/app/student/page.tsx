'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const { getUser, logout, isAuthenticated } = useAuth();
  const { loading, error, courses, getAllCourses } = useCourses();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth?role=student');
      return;
    }
    
    const userData = getUser();
    setUser(userData);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      await getAllCourses();
    } catch (err: any) {
      showToast(err.message || 'Failed to load courses', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
            {user && <p className="text-sm text-gray-600">Welcome, {user.name}</p>}
          </div>
          <div className="flex gap-4">
            <Link
              href="/student/attendance"
              className="px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              My Attendance
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No courses available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {course.course_name}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Code: {course.course_code}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Teacher: {course.teacher_name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Department: {course.department}
                </p>
                {course.batch && (
                  <p className="text-sm text-gray-600 mb-1">
                    Batch: {course.batch}
                  </p>
                )}
                {course.semester && (
                  <p className="text-sm text-gray-600">
                    Semester: {course.semester}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


