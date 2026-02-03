const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    console.log('🧪 Testing Authentication API\n');
    console.log('=================================\n');

    try {
        console.log('1️⃣  Testing Student Signup...');
        const studentSignup = await fetch(`${BASE_URL}/student/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@student.com',
                password: 'password123',
                roll_number: 'CS2024001',
                batch: '2024',
                academic_session: '2024-2025'
            })
        });
        const studentSignupData = await studentSignup.json();
        console.log('Status:', studentSignup.status);
        console.log('Response:', studentSignupData);
        console.log('✓ Student Signup Done\n');

        console.log('2️⃣  Testing Student Login...');
        const studentLogin = await fetch(`${BASE_URL}/student/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john@student.com',
                password: 'password123'
            })
        });
        const studentLoginData = await studentLogin.json();
        console.log('Status:', studentLogin.status);
        console.log('Response:', studentLoginData);
        console.log('Token:', studentLoginData.token ? 'Generated ✓' : 'Not generated ✗');
        console.log('✓ Student Login Done\n');

        console.log('3️⃣  Testing Teacher Signup...');
        const teacherSignup = await fetch(`${BASE_URL}/teacher/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Dr. Smith',
                email: 'smith@teacher.com',
                password: 'password123',
                department: 'Computer Science'
            })
        });
        const teacherSignupData = await teacherSignup.json();
        console.log('Status:', teacherSignup.status);
        console.log('Response:', teacherSignupData);
        console.log('✓ Teacher Signup Done\n');

        console.log('4️⃣  Testing Teacher Login...');
        const teacherLogin = await fetch(`${BASE_URL}/teacher/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'smith@teacher.com',
                password: 'password123'
            })
        });
        const teacherLoginData = await teacherLogin.json();
        console.log('Status:', teacherLogin.status);
        console.log('Response:', teacherLoginData);
        console.log('Token:', teacherLoginData.token ? 'Generated ✓' : 'Not generated ✗');
        console.log('✓ Teacher Login Done\n');

        console.log('=================================');
        console.log('✅ All Authentication Tests Completed!');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        console.error('\nMake sure the server is running on port 5000');
        console.error('Run: npm run dev');
    }
}

testAuth();

