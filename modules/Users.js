const dotenv = require('dotenv');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10;
dotenv.config();

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


con.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
    }
});

function createUserTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS user (
            id INT(11) NOT NULL AUTO_INCREMENT,
            username VARCHAR(255) DEFAULT NULL,
            password VARCHAR(255) DEFAULT NULL,
            email VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            admin TINYINT(1) DEFAULT 0,
            game VARCHAR(255) DEFAULT NULL,
            current_streak INT(11) DEFAULT 0,
            highest_streak INT(11) DEFAULT 0,
            PRIMARY KEY (id)
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

createUserTable();

function AddUser(name, email, password, game, msg) {
    const query = "SELECT * FROM user WHERE email = ? AND game = ?";
    const values = [email, game];
    con.query(query, values, async (err, rows) => {
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while adding item to the database' });
        } else if (rows.length === 0) {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                const insertQuery = "INSERT INTO User (username, email, password, game) VALUES (?,?,?,?)";
                const insertValues = [name, email, hash, game];
                con.query(insertQuery, insertValues, (err) => {
                    if (err) {
                        console.error('Error executing query', err);
                        msg.status(500).json({ message: 'An error occurred while adding item to the database' });
                    } else {
                        console.log('Item added successfully');
                        msg.status(200).json({ message: 'Item added successfully' });
                    }
                });
            });
        } else {
            console.log('Email already exists');
            msg.status(500).json({ message: 'Email already exists' });
        }
    });
}

function DeleteUser(token, game, msg) {
    const query = "DELETE FROM User WHERE id = ? AND game = ?";
    const values = [token, game];

    con.query(query, values, (err) => {
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while deleting item from the database' });
        } else {
            console.log('Item deleted successfully');
            msg.status(200).json({ message: 'Item deleted successfully' });
        }
    });
}

function EditUser(Name, Email, password, game, token, msg) {

    bcrypt.hash(password, saltRounds, function(err, hash) {
        const query = "UPDATE user SET username = ?, email = ?, password = ? WHERE id = ? AND game = ?";
        const values = [Name, Email, hash, token, game];
        con.query(query, values, (err) => {
            if (err) {
                console.error('Error executing query', err);
                msg.status(500).json({ error: 'An error occurred while updating user' });
            } else {
                console.log('Update successful');
                msg.status(200).json({ message: 'Update successful' });
            }
        });
    });
}

function GetUsers(game, msg) {
    const query = "SELECT * FROM user WHERE game = ?";
    const values = [game];
    con.query(query, values, (err, rows) => {
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while retrieving user information' });
        } else {
            console.log('Users information retrieved successfully');
            msg.status(200).json({ user: rows });
        }
    });
}

function GetUser(token, game, msg) {
    const query = "SELECT id,username,email,created_at,game,current_streak,highest_streak FROM user WHERE id = ? AND game = ?";
    const values = [token, game];

    con.query(query, values, (err, rows) => {
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while retrieving user information' });
        } else if (rows.length === 0) {
            msg.status(404).json({ error: 'User not found' });
        } else {
            console.log('User information retrieved successfully');
            msg.status(200).json({ user: rows[0] });
        }
    });
}

function CheckLogin(email, password, game, msg) {
    const query = "SELECT * FROM user WHERE email = ? AND game = ?";
    const values = [email, game];
    con.query(query, values, async (err, rows) => {
        if (err || rows.length === 0) {
            msg.json({
                "LoginAllowed": false,
                "Error": "User login went wrong",
            });
        } else {
            const match = await bcrypt.compare(password, rows[0].password);
            if (match) {
                msg.json({
                    "LoginAllowed": true,
                    "Token": rows[0].id,
                    "IsAdmin": rows[0].admin === 1,
                });
            } else {
                msg.json({
                    "LoginAllowed": false,
                    "Error": "User login went wrong",
                });
            }
        }
    });

}


module.exports = {
    DeleteUser,
    AddUser,
    EditUser,
    GetUsers,
    GetUser,
    CheckLogin
};
