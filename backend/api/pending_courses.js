const pool = require('../dbconnector');

// Function to fetch data from the database
const fetchData = (student_id, friend_id, callback) => {

    // Get a connection from the pool
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            callback(err, null);
            return;
        }

        // Execute a SQL query to fetch data
        const query = ` 
        SELECT course.name, course.course_id, course.semester
        FROM course
        INNER JOIN subject_user ON course.course_id = subject_user.course_id
        INNER JOIN friendship AS f1 ON (
          (f1.user1_id = ${student_id} AND f1.user2_id = ${friend_id})
          OR (f1.user1_id = ${friend_id} AND f1.user2_id = ${student_id})
        ) AND f1.status = "approved"
        INNER JOIN student ON student.student_id = subject_user.student_id
        WHERE subject_user.student_id = ${student_id} AND (subject_user.pending=1) AND student.privacy=1
        GROUP BY course.semester, course.course_id
        ORDER BY course.semester ASC;
    `;

        connection.query(query, (err, results) => {
            // Release the connection back to the pool
            connection.release();

            if (err) {
                console.error('Error executing query:', err);
                callback(err, null);
                return;
            }

            // Pass the retrieved data to the callback function
            callback(null, results);
        });
    });
};

module.exports = { fetchData };