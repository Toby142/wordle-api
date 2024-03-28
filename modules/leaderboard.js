const dotenv = require('dotenv');
const mysql = require('mysql2'); // Changed to mysql2
dotenv.config();

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// console.log(con);

con.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
    }
});

function createLeaderboardTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INT(11) NOT NULL AUTO_INCREMENT,
            score INT(255),
            user_id INT(255),
            PRIMARY KEY (id),
            KEY user_id (user_id),
            CONSTRAINT leaderboard_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    con.query(query, (err) => { 
        if (err) {
            console.error('Error creating Leaderboard table:', err);
        } else {
            console.log('Leaderboard table created or already exists');
        }
    });
}

createLeaderboardTable();

function AddToLeaderboard(token, score, msg) {
    const query = "SELECT * FROM leaderboard WHERE user_id = ?";
    const values = [score, token];
    con.query(query, values, async (err, rows) => {
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while adding item to the database' });
        }
        else if(rows.length === 0){
            const insertQuery = "INSERT INTO leaderboard (score, user_id) VALUES (?,?)"; // Renamed query variable to insertQuery
            const insertValues = [score, token]; // Renamed values variable to insertValues
            con.query(insertQuery, insertValues, async (err) => { // Updated variable names
                if(err){
                    console.log('An error occurred while adding score to the database');
                    msg.status(500).json({ message: 'An error occurred while adding leaderboard to the database' });
                }
                else{
                    console.log('Score added successfully');
                    msg.status(200).json({ message: 'Leaderboard added successfully' });
                }
            });
        }
        else{
            const updateQuery = "UPDATE leaderboard SET score = ? WHERE leaderboard.user_id = ?;"; // Renamed query variable to updateQuery
            const updateValues = [score, token]; // Renamed values variable to updateValues
            con.query(updateQuery, updateValues, (err) => { // Updated variable names
                if (err) {
                    console.error('Error executing query', err);
                    msg.status(500).json({ error: 'An error occurred while updating leaderboard' });
                } else {
                    console.log('Update successful');
                    msg.status(200).json({ message: 'Update leaderboard successful'});
                }
            });
        }
    });
}

function DeleteFromLeaderboard(id, game, msg) {
    const deleteQuery = "DELETE leaderboard FROM leaderboard INNER JOIN user ON leaderboard.user_id = user.id WHERE leaderboard.id = ? AND user.game = ?";
    const deleteValues = [id, game];
    con.query(deleteQuery, deleteValues, (err) => {
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while deleting leaderboard from the database' });
        } else {
            console.log('Score deleted successfully');
            msg.status(200).json({ message: 'Leaderboard deleted successfully' });
        }
    });
}

function EditLeaderboard(score, token, msg) {
    const updateQuery = "UPDATE leaderboard SET score = ? WHERE leaderboard.user_id = ?;";
    const updateValues = [score, token];
    console.log(token);
    con.query(updateQuery, updateValues, (err) => {
        console.log(updateQuery, updateValues);
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while updating leaderboard' });
        } else {
            console.log('Update successful');
            msg.status(200).json({ message: 'Update leaderboard successful'});
        }
    });
}

function GetLeaderBoard(game, msg) {
    const query = "SELECT leaderboard.id,score,user_id FROM leaderboard INNER JOIN user ON leaderboard.user_id = user.id WHERE game = ? ORDER BY leaderboard.score DESC;";
    const values = [game];
    con.query(query, values, (err, rows) => {
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while retrieving Leaderboard' });
        } 
        else if (rows.length === 0) {
            msg.status(404).json({ error: 'No leaderboard found' });
        } 
        else {
            console.log('Leaderboard retrieved successfully');
            msg.status(200).json({ Scores: rows });
        }
    });
}

module.exports = {
    GetLeaderBoard,
    AddToLeaderboard,
    EditLeaderboard,
    DeleteFromLeaderboard
};
