'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCourses } from '@/hooks/useCourses';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

export default function StudentAttendancePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { getUser, isAuthenticated } = useAuth();
  const { getAllCourses } = useCourses();
  const { getStudentStats } = useStats();
  
  const [loading, setLoading] = useState(true);
  const [coursesWithStats, setCoursesWithStats] = useState<any[]>([]);
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth?role=student');
      return;
    }
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const courses = await getAllCourses();
      
      const statsPromises = courses.map(async (course: any) => {
        try {
          const stats = await getStudentStats(user.id, course.id);
          return { ...course, stats };
        } catch (err) {
          return { ...course, stats: null };
        }
      });
      
      const results = await Promise.all(statsPromises);
      setCoursesWithStats(results);
      setLoading(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to load attendance', 'error');
      setLoading(false);
    }
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
        <div className="container mx-auto px-4 py-4">
          <Link href="/student" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Attendance</h1>

        <div className="grid gap-6">
          {coursesWithStats.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600">No attendance data available</p>
            </div>
          ) : (
            coursesWithStats.map((course: any) => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {course.course_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {course.course_code} • {course.teacher_name}
                    </p>
                  </div>
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    View Details →
                  </Link>
                </div>

                {course.stats ? (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-2xl font-bold text-gray-900">
                        {course.stats.total_sessions}
                      </div>
                      <div className="text-xs text-gray-600">Total Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {course.stats.sessions_attended}
                      </div>
                      <div className="text-xs text-gray-600">Attended</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-2xl font-bold text-red-600">
                        {course.stats.sessions_missed}
                      </div>
                      <div className="text-xs text-gray-600">Missed</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {course.stats.attendance_percentage}%
                      </div>
                      <div className="text-xs text-gray-600">Percentage</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No attendance data for this course</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


