// database/seed-mysql.js
// Seed MySQL database with sample data for testing - GK PAPER VERSION

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
        
        // Insert GK questions (General Knowledge)
        const questions = [
            ['GK001', 'What is the capital of India?', 5, 'descriptive', 'New Delhi', 'General Knowledge', 'easy'],
            ['GK002', 'Who is known as the Father of the Nation in India?', 5, 'descriptive', 'Mahatma Gandhi', 'General Knowledge', 'easy'],
            ['GK003', 'What is the national animal of India?', 5, 'descriptive', 'Tiger', 'General Knowledge', 'easy'],
            ['GK004', 'Which planet is known as the Red Planet?', 5, 'descriptive', 'Mars', 'General Knowledge', 'easy'],
            ['GK005', 'Who wrote the Indian national anthem?', 5, 'descriptive', 'Rabindranath Tagore', 'General Knowledge', 'medium'],
            ['GK006', 'What is the longest river in India?', 5, 'descriptive', 'Ganges', 'General Knowledge', 'medium'],
            ['GK007', 'Which is the largest desert in the world?', 5, 'descriptive', 'Sahara Desert', 'General Knowledge', 'medium'],
            ['GK008', 'Who was the first Prime Minister of India?', 5, 'descriptive', 'Jawaharlal Nehru', 'General Knowledge', 'easy'],
            ['GK009', 'What is the national flower of India?', 5, 'descriptive', 'Lotus', 'General Knowledge', 'easy'],
            ['GK010', 'Which is the smallest ocean in the world?', 5, 'descriptive', 'Arctic Ocean', 'General Knowledge', 'medium']
        ];
        
        const questionIds = [];
        for (const q of questions) {
            const [result] = await connection.execute(
                'INSERT INTO questions (question_id, question_text, marks, question_type, correct_answer, subject, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
                q
            );
            questionIds.push(result.insertId);
        }
        console.log(`✅ Inserted ${questions.length} GK questions`);
        
        // Insert question paper - GK PAPER
        const [paperResult] = await connection.execute(
            'INSERT INTO question_papers (paper_id, title, subject, description, duration, total_marks) VALUES (?, ?, ?, ?, ?, ?)',
            ['GK101', 'General Knowledge Examination', 'General Knowledge', 'Test your knowledge about India and the world', 60, 50]
        );
        const paperId = paperResult.insertId;
        
        // Link questions to paper
        for (let i = 0; i < questionIds.length; i++) {
            await connection.execute(
                'INSERT INTO paper_questions (paper_id, question_id, question_order) VALUES (?, ?, ?)',
                [paperId, questionIds[i], i + 1]
            );
        }
        
        console.log(`✅ Created question paper: General Knowledge Examination`);
        console.log(`   Paper ID: GK101`);
        console.log(`   Subject: General Knowledge`);
        console.log(`   Total Questions: ${questions.length}`);
        console.log(`   Total Marks: 50`);
        
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 You can now:');
        console.log('   1. Start the server: cd backend && node server.js');
        console.log('   2. Login with roll number: 2024001 and password: student123');
        console.log('   3. Select paper: GK101 (General Knowledge)');
        console.log('\n🎤 Voice Commands:');
        console.log('   - "Select GK paper" or "Select General Knowledge paper"');
        console.log('   - "Begin paper" to start the exam');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

seedDatabase();