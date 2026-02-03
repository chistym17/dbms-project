const BASE_URL = 'http://localhost:5000/api';

let teacherToken = '';
let courseId = '';
let sessionId = '';

async function testSessions() {
    console.log('🧪 Testing Session Management API\n');
    console.log('=================================\n');

    try {
        console.log('0️⃣  Setup: Getting Teacher Token & Creating Course...');
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

        const createCourse = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                course_name: 'Web Development',
                course_code: 'CS401',
                semester: 'Spring 2025',
                batch: '2024',
                academic_session: '2024-2025'
            })
        });
        const courseData = await createCourse.json();
        courseId = courseData.course?.id;
        console.log('Course Created:', courseId ? `ID: ${courseId} ✓\n` : 'Failed ✗\n');

        console.log('1️⃣  Testing Create Session with Duration...');
        const createSession1 = await fetch(`${BASE_URL}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                course_id: courseId,
                session_date: '2025-02-05',
                session_time: '10:00:00',
                duration_minutes: 30
            })
        });
        const session1Data = await createSession1.json();
        sessionId = session1Data.session?.id;
        console.log('Status:', createSession1.status);
        console.log('Session ID:', sessionId);
        console.log('QR Token:', session1Data.session?.qr_code);
        console.log('QR Image:', session1Data.session?.qr_code_image ? 'Generated ✓' : 'Not Generated ✗');
        console.log('Duration:', session1Data.session?.duration_minutes, 'minutes');
        console.log('✓ Session with Duration Created\n');

        console.log('2️⃣  Testing Create Session without Duration (All Day)...');
        const createSession2 = await fetch(`${BASE_URL}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                course_id: courseId,
                session_date: '2025-02-06',
                session_time: '11:00:00'
            })
        });
        const session2Data = await createSession2.json();
        console.log('Status:', createSession2.status);
        console.log('Session ID:', session2Data.session?.id);
        console.log('Duration:', session2Data.session?.duration_minutes === null ? 'All Day ✓' : session2Data.session?.duration_minutes);
        console.log('✓ All-Day Session Created\n');

        console.log('3️⃣  Testing Get Course Sessions...');
        const getSessions = await fetch(`${BASE_URL}/sessions/course/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const sessionsData = await getSessions.json();
        console.log('Status:', getSessions.status);
        console.log('Total Sessions:', sessionsData.sessions?.length);
        console.log('✓ Course Sessions Retrieved\n');

        console.log('4️⃣  Testing Get Session By ID with QR...');
        const getSession = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const sessionData = await getSession.json();
        console.log('Status:', getSession.status);
        console.log('Session Date:', sessionData.session?.session_date);
        console.log('Session Time:', sessionData.session?.session_time);
        console.log('QR Code Image:', sessionData.session?.qr_code_image ? 'Available ✓' : 'Not Available ✗');
        console.log('✓ Session Retrieved with QR\n');

        console.log('5️⃣  Testing Update Session...');
        const updateSession = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                session_date: '2025-02-07',
                session_time: '14:00:00',
                duration_minutes: 45
            })
        });
        const updateData = await updateSession.json();
        console.log('Status:', updateSession.status);
        console.log('Updated Date:', updateData.session?.session_date);
        console.log('Updated Duration:', updateData.session?.duration_minutes, 'minutes');
        console.log('✓ Session Updated\n');

        console.log('6️⃣  Testing Delete Session...');
        const deleteSession = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const deleteData = await deleteSession.json();
        console.log('Status:', deleteSession.status);
        console.log('Response:', deleteData.message);
        console.log('✓ Session Deleted\n');

        console.log('=================================');
        console.log('✅ All Session Tests Completed!');
        console.log('\n📝 Note: QR Code images are base64 data URLs');
        console.log('    Display them in frontend using <img src={qr_code_image} />');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        console.error('\nMake sure:');
        console.error('1. Server is running (npm run dev)');
        console.error('2. Teacher account exists (run testAuth.js first)');
        console.error('3. Database tables are created (run database/init.js)');
    }
}

testSessions();

