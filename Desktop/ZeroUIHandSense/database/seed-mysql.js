
// database/seed-mysql.js
// Seed MySQL database with sample data for testing

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedDatabase() {
    let connection;
    
    try {
        console.log('🌱 Starting MySQL seeding...');
        
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'handsense_exam'
        });
        
        console.log('✅ Connected to MySQL');
        
        // Clear existing data (order matters due to foreign keys)
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('DELETE FROM answers');
        await connection.execute('DELETE FROM exam_sessions');
        await connection.execute('DELETE FROM paper_questions');
        await connection.execute('DELETE FROM question_papers');
        await connection.execute('DELETE FROM questions');
        await connection.execute('DELETE FROM users');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🗑️ Cleared existing data');
        
        // Insert sample student (password: student123)
        const hashedPassword = await bcrypt.hash('student123', 10);
        const [userResult] = await connection.execute(
            'INSERT INTO users (roll_number, name, class, password) VALUES (?, ?, ?, ?)',
            ['2024001', 'Test Student', '12th Grade', hashedPassword]
        );
        console.log('✅ Created student: 2024001 / student123');
        
        // Insert questions
        const questions = [
            ['Q001', 'What is 2 + 2?', 5, 'numerical', '4', 'Mathematics', 'easy'],
            ['Q002', 'Explain the Pythagorean theorem in your own words.', 10, 'descriptive', 'In a right triangle, the square of the hypotenuse equals sum of squares of other two sides', 'Mathematics', 'medium'],
            ['Q003', 'What is the capital of France?', 5, 'descriptive', 'Paris', 'Geography', 'easy'],
            ['Q004', 'Solve: 15 × 3 = ?', 5, 'numerical', '45', 'Mathematics', 'easy'],
            ['Q005', 'What is the square root of 144?', 5, 'numerical', '12', 'Mathematics', 'medium']
        ];
        
        const questionIds = [];
        for (const q of questions) {
            const [result] = await connection.execute(
                'INSERT INTO questions (question_id, question_text, marks, question_type, correct_answer, subject, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
                q
            );
            questionIds.push(result.insertId);
        }
        console.log(`✅ Inserted ${questions.length} questions`);
        
        // Insert question paper
        const [paperResult] = await connection.execute(
            'INSERT INTO question_papers (paper_id, title, subject, description, duration, total_marks) VALUES (?, ?, ?, ?, ?, ?)',
            ['MATH101', 'Mathematics Final Examination', 'Mathematics', 'This paper tests basic mathematical concepts', 60, 30]
        );
        const paperId = paperResult.insertId;
        
        // Link questions to paper
        for (let i = 0; i < questionIds.length; i++) {
            await connection.execute(
                'INSERT INTO paper_questions (paper_id, question_id, question_order) VALUES (?, ?, ?)',
                [paperId, questionIds[i], i + 1]
            );
        }
        
        console.log(`✅ Created question paper: Mathematics Final Examination`);
        console.log(`   Paper ID: MATH101`);
        console.log(`   Total Questions: ${questions.length}`);
        
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 You can now:');
        console.log('   1. Start the server: cd backend && node server.js');
        console.log('   2. Login with roll number: 2024001 and password: student123');
        console.log('   3. Select paper: MATH101');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

seedDatabase();
