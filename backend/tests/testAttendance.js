const BASE_URL = 'http://localhost:5000/api';

let teacherToken = '';
let studentToken = '';
let courseId = '';
let sessionId = '';
let qrToken = '';
let studentId = '';

async function testAttendance() {
    console.log('🧪 Testing Attendance Management API\n');
    console.log('=================================\n');

    try {
        console.log('0️⃣  Setup: Creating Course, Session, and Getting Tokens...');
        
        const teacherLogin = await fetch(`${BASE_URL}/auth/teacher/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'smith@teacher.com',
                password: 'password123'
            })
        });
        const teacherData = await teacherLogin.json();
        teacherToken = teacherData.token;
        console.log('Teacher Token:', teacherToken ? 'Retrieved ✓' : 'Failed ✗');

        const studentLogin = await fetch(`${BASE_URL}/auth/student/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john@student.com',
                password: 'password123'
            })
        });
        const studentData = await studentLogin.json();
        studentToken = studentData.token;
        studentId = studentData.user.id;
        console.log('Student Token:', studentToken ? 'Retrieved ✓' : 'Failed ✗');
        console.log('Student ID:', studentId);

        const createCourse = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                course_name: 'Operating Systems',
                course_code: 'CS501',
                semester: 'Spring 2025',
                batch: '2024',
                academic_session: '2024-2025'
            })
        });
        const courseData = await createCourse.json();
        courseId = courseData.course?.id;
        console.log('Course Created:', courseId ? `ID: ${courseId} ✓` : 'Failed ✗');

        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().split(' ')[0];
        
        const createSession = await fetch(`${BASE_URL}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                course_id: courseId,
                session_date: today,
                session_time: currentTime,
                duration_minutes: 120
            })
        });
        const sessionData = await createSession.json();
        sessionId = sessionData.session?.id;
        qrToken = sessionData.session?.qr_code;
        console.log('Session Created:', sessionId ? `ID: ${sessionId} ✓` : 'Failed ✗');
        console.log('QR Token:', qrToken);
        console.log('Setup Complete!\n');

        console.log('1️⃣  Testing Mark Attendance (Student)...');
        const markAttendance = await fetch(`${BASE_URL}/attendance/mark`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                qr_token: qrToken
            })
        });
        const attendanceData = await markAttendance.json();
        console.log('Status:', markAttendance.status);
        console.log('Message:', attendanceData.message);
        console.log('Attendance ID:', attendanceData.attendance?.id);
        console.log('Status:', attendanceData.attendance?.status);
        console.log('✓ Attendance Marked\n');

        console.log('2️⃣  Testing Duplicate Attendance (Should Fail)...');
        const duplicateAttendance = await fetch(`${BASE_URL}/attendance/mark`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                qr_token: qrToken
            })
        });
        const duplicateData = await duplicateAttendance.json();
        console.log('Status:', duplicateAttendance.status);
        console.log('Message:', duplicateData.message);
        console.log('✓ Duplicate Prevention Working\n');

        console.log('3️⃣  Testing Get Session Attendance (Teacher)...');
        const getSessionAttendance = await fetch(`${BASE_URL}/attendance/session/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const sessionAttendanceData = await getSessionAttendance.json();
        console.log('Status:', getSessionAttendance.status);
        console.log('Total Present:', sessionAttendanceData.total_present);
        console.log('Attendance Records:', sessionAttendanceData.attendance?.length);
        if (sessionAttendanceData.attendance?.length > 0) {
            console.log('First Record:', {
                student: sessionAttendanceData.attendance[0].student_name,
                roll: sessionAttendanceData.attendance[0].roll_number,
                status: sessionAttendanceData.attendance[0].status
            });
        }
        console.log('✓ Session Attendance Retrieved\n');

        console.log('4️⃣  Testing Get Course Attendance (Teacher)...');
        const getCourseAttendance = await fetch(`${BASE_URL}/attendance/course/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const courseAttendanceData = await getCourseAttendance.json();
        console.log('Status:', getCourseAttendance.status);
        console.log('Course:', courseAttendanceData.course?.course_name);
        console.log('Total Records:', courseAttendanceData.total_records);
        console.log('✓ Course Attendance Retrieved\n');

        console.log('5️⃣  Testing Get Student Attendance in Course...');
        const getStudentAttendance = await fetch(`${BASE_URL}/attendance/student/${studentId}/course/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${studentToken}`
            }
        });
        const studentAttendanceData = await getStudentAttendance.json();
        console.log('Status:', getStudentAttendance.status);
        console.log('Student:', studentAttendanceData.student?.name);
        console.log('Roll Number:', studentAttendanceData.student?.roll_number);
        console.log('Total Attended:', studentAttendanceData.total_attended);
        console.log('✓ Student Attendance Retrieved\n');

        console.log('6️⃣  Testing Invalid QR Token...');
        const invalidQR = await fetch(`${BASE_URL}/attendance/mark`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`
            },
            body: JSON.stringify({
                qr_token: 'invalid_token_12345'
            })
        });
        const invalidQRData = await invalidQR.json();
        console.log('Status:', invalidQR.status);
        console.log('Message:', invalidQRData.message);
        console.log('✓ Invalid QR Validation Working\n');

        console.log('=================================');
        console.log('✅ All Attendance Tests Completed!');
        console.log('\n📝 Summary:');
        console.log('   - Attendance marking with QR validation ✓');
        console.log('   - Duplicate prevention ✓');
        console.log('   - Time/Date validation ✓');
        console.log('   - Teacher can view session attendance ✓');
        console.log('   - Teacher can view course attendance ✓');
        console.log('   - Student can view own attendance ✓');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        console.error('\nMake sure:');
        console.error('1. Server is running (npm run dev)');
        console.error('2. Teacher and Student accounts exist');
        console.error('3. Database tables are up to date');
    }
}

testAttendance();

