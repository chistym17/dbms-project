'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCourses } from '@/hooks/useCourses';
import { useStats } from '@/hooks/useStats';
import { useAttendance } from '@/hooks/useAttendance';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';

export default function StudentCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { showToast } = useToast();
  const { getUser, isAuthenticated } = useAuth();
  const { getCourseById } = useCourses();
  const { getStudentStats, loading: statsLoading, stats } = useStats();
  const { markAttendance, loading: attendanceLoading } = useAttendance();
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth?role=student');
      return;
    }
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const courseData = await getCourseById(courseId);
      setCourse(courseData);
      
      if (user?.id) {
        await getStudentStats(user.id, courseId);
      }
      
      setLoading(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to load course', 'error');
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setScanning(true);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      showToast('Failed to start camera. Use manual entry.', 'error');
      setScanMode('manual');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleScanSuccess = async (qrCode: string) => {
    await stopScanner();
    try {
      const result = await markAttendance(qrCode);
      showToast(result.message || 'Attendance marked successfully!', 'success');
      setShowScanner(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark attendance', 'error');
      setShowScanner(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!qrInput.trim()) {
      showToast('Please enter QR code', 'error');
      return;
    }

    try {
      const result = await markAttendance(qrInput);
      showToast(result.message || 'Attendance marked successfully!', 'success');
      setShowScanner(false);
      setQrInput('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to mark attendance', 'error');
    }
  };

  const closeScanner = async () => {
    await stopScanner();
    setShowScanner(false);
    setQrInput('');
    setScanMode('camera');
  };

  useEffect(() => {
    if (showScanner && scanMode === 'camera' && !scanning) {
      startScanner();
    }
    
    return () => {
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [showScanner, scanMode]);

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
        {course && (
          <>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.course_name}
              </h1>
              <p className="text-gray-600">Code: {course.course_code}</p>
              <p className="text-gray-600">Teacher: {course.teacher_name}</p>
              <p className="text-gray-600">Semester: {course.semester}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Mark Attendance
                </h2>
                
                {!showScanner ? (
                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                  >
                    📸 Scan QR Code
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setScanMode('camera')}
                        className={`flex-1 py-2 px-4 rounded ${
                          scanMode === 'camera'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Camera
                      </button>
                      <button
                        onClick={() => {
                          stopScanner();
                          setScanMode('manual');
                        }}
                        className={`flex-1 py-2 px-4 rounded ${
                          scanMode === 'manual'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Manual
                      </button>
                    </div>

                    {scanMode === 'camera' ? (
                      <div>
                        <div 
                          id="qr-reader" 
                          className="border-2 border-gray-300 rounded-lg overflow-hidden"
                        ></div>
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          Point camera at QR code
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Enter the QR code text manually
                        </p>
                        <input
                          type="text"
                          value={qrInput}
                          onChange={(e) => setQrInput(e.target.value)}
                          placeholder="Paste QR code here"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                        <button
                          onClick={handleManualSubmit}
                          disabled={attendanceLoading}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {attendanceLoading ? 'Marking...' : 'Submit'}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={closeScanner}
                      className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  My Statistics
                </h2>
                {statsLoading ? (
                  <p className="text-gray-600">Loading stats...</p>
                ) : stats ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sessions:</span>
                      <span className="font-semibold">{stats.total_sessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attended:</span>
                      <span className="font-semibold text-green-600">
                        {stats.sessions_attended}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Missed:</span>
                      <span className="font-semibold text-red-600">
                        {stats.sessions_missed}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-900 font-semibold">Percentage:</span>
                      <span className="font-bold text-xl text-blue-600">
                        {stats.attendance_percentage}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No stats available</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Attendance Records
              </h2>
              {stats?.records && stats.records.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-left py-2 px-4">Time</th>
                        <th className="text-left py-2 px-4">Status</th>
                        <th className="text-left py-2 px-4">Marked At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.records.map((record: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">
                            {new Date(record.session_date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4">{record.session_time}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                record.status === 'present'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {record.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-gray-600">
                            {record.marked_at
                              ? new Date(record.marked_at).toLocaleString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No attendance records yet</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

