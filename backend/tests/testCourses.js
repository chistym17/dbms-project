const BASE_URL = 'http://localhost:5000/api';

let teacherToken = '';
let studentToken = '';
let courseId = '';

async function testCourses() {
    console.log('🧪 Testing Course Management API\n');
    console.log('=================================\n');

    try {
        console.log('0️⃣  Getting Teacher & Student Tokens...');
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
        console.log('Student Token:', studentToken ? 'Retrieved ✓\n' : 'Failed ✗\n');

        console.log('1️⃣  Testing Create Course (Teacher)...');
        const createCourse = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                course_name: 'Database Management Systems',
                course_code: 'CS301',
                semester: 'Spring 2025',
                batch: '2024',
                academic_session: '2024-2025'
            })
        });
        const courseData = await createCourse.json();
        courseId = courseData.course?.id;
        console.log('Status:', createCourse.status);
        console.log('Response:', courseData);
        console.log('✓ Course Created\n');

        console.log('2️⃣  Testing Get All Courses (Student)...');
        const getAllCourses = await fetch(`${BASE_URL}/courses`, {
            headers: {
                'Authorization': `Bearer ${studentToken}`
            }
        });
        const allCoursesData = await getAllCourses.json();
        console.log('Status:', getAllCourses.status);
        console.log('Total Courses:', allCoursesData.courses?.length);
        console.log('✓ All Courses Retrieved\n');

        console.log('3️⃣  Testing Get Teacher Courses...');
        const getTeacherCourses = await fetch(`${BASE_URL}/courses/teacher`, {
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const teacherCoursesData = await getTeacherCourses.json();
        console.log('Status:', getTeacherCourses.status);
        console.log('Teacher Courses:', teacherCoursesData.courses?.length);
        console.log('✓ Teacher Courses Retrieved\n');

        console.log('4️⃣  Testing Get Course By ID...');
        const getCourseById = await fetch(`${BASE_URL}/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${studentToken}`
            }
        });
        const courseByIdData = await getCourseById.json();
        console.log('Status:', getCourseById.status);
        console.log('Course:', courseByIdData.course);
        console.log('✓ Course Retrieved\n');

        console.log('5️⃣  Testing Update Course (Teacher)...');
        const updateCourse = await fetch(`${BASE_URL}/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${teacherToken}`
            },
            body: JSON.stringify({
                course_name: 'Advanced Database Systems',
                course_code: 'CS301',
                semester: 'Spring 2025',
                batch: '2024',
                academic_session: '2024-2025'
            })
        });
        const updateData = await updateCourse.json();
        console.log('Status:', updateCourse.status);
        console.log('Response:', updateData);
        console.log('✓ Course Updated\n');

        console.log('6️⃣  Testing Delete Course (Teacher)...');
        const deleteCourse = await fetch(`${BASE_URL}/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${teacherToken}`
            }
        });
        const deleteData = await deleteCourse.json();
        console.log('Status:', deleteCourse.status);
        console.log('Response:', deleteData);
        console.log('✓ Course Deleted\n');

        console.log('=================================');
        console.log('✅ All Course Tests Completed!');

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        console.error('\nMake sure:');
        console.error('1. Server is running (npm run dev)');
        console.error('2. Teacher and Student accounts exist (run testAuth.js first)');
    }
}

testCourses();

