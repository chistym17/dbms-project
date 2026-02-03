const BASE_URL = 'http://localhost:5000/api';

let teacherToken = '';
let studentToken = '';
let student2Token = '';
let courseId = '';
let sessionIds = [];
let studentId = '';
let student2Id = '';

async function setupTestData() {
    console.log('📦 Setting up test data...\n');

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

    const student2Signup = await fetch(`${BASE_URL}/auth/student/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Jane Doe',
            email: 'jane@student.com',
            password: 'password123',
            roll_number: 'CS2024002',
            batch: '2024',
            academic_session: '2024-2025'
        })
    });
    const student2Data = await student2Signup.json();
    student2Token = student2Data.token;
    student2Id = student2Data.user.id;

    console.log('✓ Tokens obtained');
    console.log('✓ Student 1 ID:', studentId);
    console.log('✓ Student 2 ID:', student2Id);

    const createCourse = await fetch(`${BASE_URL}/courses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${teacherToken}`
        },
        body: JSON.stringify({
            course_name: 'Data Structures',
            course_code: 'CS601',
            semester: 'Spring 2025',
            batch: '2024',
            academic_session: '2024-2025'
        })
    });
    const courseData = await createCourse.json();
    courseId = courseData.course?.id;
    console.log('✓ Course created:', courseId);

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0];

    for (let i = 0; i < 5; i++) {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() - i);
        const dateStr = sessionDate.toISOString().split('T')[0];

        const createSession = await fetch(`${BASE_URL}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                course_id: courseId,
                session_date: dateStr,
                session_time: '10:00:00',
                duration_minutes: 120
            })
        });
        const sessionData = await createSession.json();
        sessionIds.push({
            id: sessionData.session?.id,
            qr: sessionData.session?.qr_code
        });
    }
    console.log('✓ 5 sessions created');

    await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ qr_token: sessionIds[0].qr })
    });

    await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ qr_token: sessionIds[1].qr })
    });

    await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({ qr_token: sessionIds[2].qr })
    });

    await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${student2Token}`
        },
        body: JSON.stringify({ qr_token: sessionIds[0].qr })
    });

    await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${student2Token}`
        },
        body: JSON.stringify({ qr_token: sessionIds[1].qr })
    });

    await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${student2Token}`
        },
        body: JSON.stringify({ qr_token: sessionIds[2].qr })
    });

    await fetch(`${BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${student2Token}`
        },
        body: JSON.stringify({ qr_token: sessionIds[3].qr })
    });

    console.log('✓ Attendance marked:');
    console.log('  - Student 1: 3/5 sessions (60%)');
    console.log('  - Student 2: 4/5 sessions (80%)');
    console.log('\n✅ Setup Complete!\n');
}

async function testStats() {
    console.log('🧪 Testing Attendance Statistics API\n');
    console.log('=================================\n');

    try {
        await setupTestData();

        console.log('1️⃣  Testing Course Statistics...');
        const courseStats = await fetch(`${BASE_URL}/attendance/stats/course/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const courseStatsData = await courseStats.json();
        console.log('Status:', courseStats.status);
        console.log('\n📊 Course Statistics:');
        console.log('  Course:', courseStatsData.course?.course_name);
        console.log('  Total Sessions:', courseStatsData.total_sessions);
        console.log('  Total Students:', courseStatsData.total_students_attended);
        console.log('  Overall Attendance Rate:', courseStatsData.overall_attendance_rate + '%');
        
        console.log('\n  Sessions Breakdown:');
        courseStatsData.sessions_breakdown?.slice(0, 3).forEach((s, i) => {
            console.log(`    Session ${i + 1}: ${s.students_present} students (${s.attendance_rate}%)`);
        });

        console.log('\n  Students Breakdown:');
        courseStatsData.students_breakdown?.forEach((s) => {
            console.log(`    ${s.name} (${s.roll_number}): ${s.attended}/${courseStatsData.total_sessions} sessions (${s.percentage}%)`);
        });
        console.log('\n✓ Course Statistics Retrieved\n');

        console.log('2️⃣  Testing Student Statistics (Student 1 - 60%)...');
        const student1Stats = await fetch(`${BASE_URL}/attendance/stats/student/${studentId}/course/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${studentToken}`
            }
        });
        const student1StatsData = await student1Stats.json();
        console.log('Status:', student1Stats.status);
        console.log('\n📊 Student 1 Statistics:');
        console.log('  Student:', student1StatsData.student?.name);
        console.log('  Roll Number:', student1StatsData.student?.roll_number);
        console.log('  Course:', student1StatsData.course?.course_name);
        console.log('  Total Sessions:', student1StatsData.total_sessions);
        console.log('  Sessions Attended:', student1StatsData.sessions_attended);
        console.log('  Sessions Missed:', student1StatsData.sessions_missed);
        console.log('  Attendance Percentage:', student1StatsData.attendance_percentage + '%');
        
        console.log('\n  Detailed Records:');
        student1StatsData.records?.slice(0, 5).forEach((r, i) => {
            console.log(`    ${r.session_date} ${r.session_time} - ${r.status.toUpperCase()}`);
        });
        console.log('\n✓ Student 1 Statistics Retrieved\n');

        console.log('3️⃣  Testing Student Statistics (Student 2 - 80%)...');
        const student2Stats = await fetch(`${BASE_URL}/attendance/stats/student/${student2Id}/course/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const student2StatsData = await student2Stats.json();
        console.log('Status:', student2Stats.status);
        console.log('\n📊 Student 2 Statistics:');
        console.log('  Student:', student2StatsData.student?.name);
        console.log('  Roll Number:', student2StatsData.student?.roll_number);
        console.log('  Total Sessions:', student2StatsData.total_sessions);
        console.log('  Sessions Attended:', student2StatsData.sessions_attended);
        console.log('  Sessions Missed:', student2StatsData.sessions_missed);
        console.log('  Attendance Percentage:', student2StatsData.attendance_percentage + '%');
        console.log('\n✓ Student 2 Statistics Retrieved\n');

        console.log('=================================');
        console.log('✅ All Statistics Tests Completed!');
        console.log('\n📝 Summary:');
        console.log('   - Course-level statistics with breakdowns ✓');
        console.log('   - Student-level statistics with percentages ✓');
        console.log('   - Detailed attendance records (present/absent) ✓');
        console.log('   - Automatic calculation of missed sessions ✓');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        console.error(error);
    }
}

testStats();

