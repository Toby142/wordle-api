const dotenv = require('dotenv');
const mysql = require('mysql');
dotenv.config();        

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
function AddToLeaderboard(token, score, msg) {
    const query = "SELECT * FROM Leaderboard WHERE user_id = ?";
    const values = [token];
    con.query(query, values, async (err, rows) => {
        if (err) {
            console.error('Error executing query', err);
            msg.status(500).json({ error: 'An error occurred while adding item to the database' });
        }
        else if(rows.length === 0){
            const query = "INSERT INTO Leaderboard (score, user_id) VALUES (?,?)";
            const values = [score, token];
            con.query(query, values, async (err) => {
                if(err){
                    console.log('An error occurred while adding score to the database');
                    msg.status(500).json({ message: 'An error occurred while adding leaderboard to the database' });
                }
                else{
                    console.log('Score added successfully');
                    msg.status(200).json({ message: 'Leaderboard added successfully' });
                }
        });}
        else{
            const query = "UPDATE leaderboard SET score = ? WHERE leaderboard.user_id = ?;";
            const values = [score,token];
            con.query(query, values, (err) => {
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

function DeleteFromLeaderboard(id,game, msg) {
    const query = "DELETE leaderboard FROM leaderboard INNER JOIN user ON leaderboard.user_id = user.id WHERE leaderboard.id = ? AND user.game = ?";
    const values = [id,game];

    con.query(query, values, (err) => {
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
        const query = "UPDATE leaderboard SET score = ? WHERE leaderboard.user_id = ?;";
        const values = [score,token];
        console.log(token);
        con.query(query, values, (err) => {
            console.log(query, values);
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