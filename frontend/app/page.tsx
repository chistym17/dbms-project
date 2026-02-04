import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Attendance Management System
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Simple and efficient attendance tracking using QR codes
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/auth?role=student"
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">🎓</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Student Login
              </h2>
              <p className="text-gray-600">
                Mark attendance and track your progress
              </p>
            </Link>

            <Link
              href="/auth?role=teacher"
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Teacher Login
              </h2>
              <p className="text-gray-600">
                Manage courses and track attendance
              </p>
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-lg mb-2">QR Code Based</h3>
              <p className="text-gray-600 text-sm">
                Quick and contactless attendance marking using QR codes
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-lg mb-2">Real-time Stats</h3>
              <p className="text-gray-600 text-sm">
                Track attendance percentage and view detailed analytics
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-semibold text-lg mb-2">Time-based</h3>
              <p className="text-gray-600 text-sm">
                Set expiry time for QR codes to prevent proxy attendance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
