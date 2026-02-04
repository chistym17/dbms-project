'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCourses } from '@/hooks/useCourses';
import { useSessions } from '@/hooks/useSessions';
import { useAttendance } from '@/hooks/useAttendance';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

type Tab = 'sessions' | 'attendance' | 'statistics';

export default function TeacherCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { getCourseById } = useCourses();
  const { createSession, getCourseSessions, sessions, loading: sessionsLoading } = useSessions();
  const { getCourseAttendance, attendance, loading: attendanceLoading } = useAttendance();
  const { getCourseStats, stats, loading: statsLoading } = useStats();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('sessions');
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  
  const [sessionForm, setSessionForm] = useState({
    session_date: '',
    session_time: '',
    duration_minutes: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth?role=teacher');
      return;
    }
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const courseData = await getCourseById(courseId);
      setCourse(courseData);
      await getCourseSessions(courseId);
      setLoading(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to load course', 'error');
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createSession({
        course_id: parseInt(courseId),
        session_date: sessionForm.session_date,
        session_time: sessionForm.session_time,
        duration_minutes: sessionForm.duration_minutes ? parseInt(sessionForm.duration_minutes) : undefined
      });
      
      showToast('Session created successfully!', 'success');
      setShowCreateSession(false);
      setSessionForm({ session_date: '', session_time: '', duration_minutes: '' });
      
      setSelectedSession(result.session);
      setShowSessionDetail(true);
      await getCourseSessions(courseId);
    } catch (err: any) {
      showToast(err.message || 'Failed to create session', 'error');
    }
  };

  const loadAttendance = async () => {
    try {
      await getCourseAttendance(courseId);
    } catch (err: any) {
      showToast(err.message || 'Failed to load attendance', 'error');
    }
  };

  const loadStats = async () => {
    try {
      await getCourseStats(courseId);
    } catch (err: any) {
      showToast(err.message || 'Failed to load statistics', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadAttendance();
    } else if (activeTab === 'statistics') {
      loadStats();
    }
  }, [activeTab]);

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
          <Link href="/teacher" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {course && (
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.course_name}
              </h1>
              <p className="text-gray-600">Code: {course.course_code}</p>
              <p className="text-gray-600">
                {course.semester} • Batch: {course.batch} • {course.academic_session}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`flex-1 py-4 px-6 font-medium ${
                    activeTab === 'sessions'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sessions
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`flex-1 py-4 px-6 font-medium ${
                    activeTab === 'attendance'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`flex-1 py-4 px-6 font-medium ${
                    activeTab === 'statistics'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Statistics
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'sessions' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Course Sessions
                      </h2>
                      <button
                        onClick={() => setShowCreateSession(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Create Session
                      </button>
                    </div>

                    {sessionsLoading ? (
                      <p className="text-gray-600">Loading sessions...</p>
                    ) : sessions.length === 0 ? (
                      <p className="text-gray-600">No sessions yet</p>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((session: any) => (
                          <div
                            key={session.id}
                            className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {new Date(session.session_date).toLocaleDateString()} at {session.session_time}
                              </p>
                              <p className="text-sm text-gray-600">
                                {session.duration_minutes 
                                  ? `Duration: ${session.duration_minutes} minutes`
                                  : 'Valid all day'}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setShowSessionDetail(true);
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              View QR
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Attendance Records
                    </h2>

                    {attendanceLoading ? (
                      <p className="text-gray-600">Loading attendance...</p>
                    ) : attendance.length === 0 ? (
                      <p className="text-gray-600">No attendance records yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4">Student</th>
                              <th className="text-left py-2 px-4">Roll Number</th>
                              <th className="text-left py-2 px-4">Date</th>
                              <th className="text-left py-2 px-4">Time</th>
                              <th className="text-left py-2 px-4">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendance.map((record: any) => (
                              <tr key={record.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{record.student_name}</td>
                                <td className="py-2 px-4">{record.roll_number}</td>
                                <td className="py-2 px-4">
                                  {new Date(record.session_date).toLocaleDateString()}
                                </td>
                                <td className="py-2 px-4">{record.session_time}</td>
                                <td className="py-2 px-4">
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                                    {record.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'statistics' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Course Statistics
                    </h2>

                    {statsLoading ? (
                      <p className="text-gray-600">Loading statistics...</p>
                    ) : stats ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">
                              {stats.total_sessions}
                            </div>
                            <div className="text-sm text-gray-600">Total Sessions</div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {stats.total_students_attended}
                            </div>
                            <div className="text-sm text-gray-600">Total Students</div>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {stats.overall_attendance_rate}%
                            </div>
                            <div className="text-sm text-gray-600">Overall Rate</div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Student-wise Attendance
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-4">Student</th>
                                  <th className="text-left py-2 px-4">Roll Number</th>
                                  <th className="text-left py-2 px-4">Attended</th>
                                  <th className="text-left py-2 px-4">Missed</th>
                                  <th className="text-left py-2 px-4">Percentage</th>
                                </tr>
                              </thead>
                              <tbody>
                                {stats.students_breakdown?.map((student: any) => (
                                  <tr key={student.student_id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4">{student.name}</td>
                                    <td className="py-2 px-4">{student.roll_number}</td>
                                    <td className="py-2 px-4 text-green-600">{student.attended}</td>
                                    <td className="py-2 px-4 text-red-600">{student.missed}</td>
                                    <td className="py-2 px-4">
                                      <span className="font-semibold">{student.percentage}%</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No statistics available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Session</h2>
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Date *
                </label>
                <input
                  type="date"
                  required
                  value={sessionForm.session_date}
                  onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Time *
                </label>
                <input
                  type="time"
                  required
                  value={sessionForm.session_time}
                  onChange={(e) => setSessionForm({ ...sessionForm, session_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={sessionForm.duration_minutes}
                  onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="Leave empty for all-day validity"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={sessionsLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {sessionsLoading ? 'Creating...' : 'Create & Show QR'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSessionDetail && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Session QR Code</h2>
            
            <div className="mb-4">
              <p className="text-gray-600">
                Date: {new Date(selectedSession.session_date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">Time: {selectedSession.session_time}</p>
              <p className="text-gray-600">
                {selectedSession.duration_minutes 
                  ? `Valid for ${selectedSession.duration_minutes} minutes`
                  : 'Valid all day'}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-4 text-center">
              {selectedSession.qr_code_image ? (
                <img 
                  src={selectedSession.qr_code_image} 
                  alt="QR Code" 
                  className="mx-auto max-w-xs"
                />
              ) : (
                <div className="bg-white p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600 mb-2">QR Code Token:</p>
                  <p className="font-mono text-sm break-all">{selectedSession.qr_code}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSessionDetail(false)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


