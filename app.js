const express = require('express');
const http  = require('http');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors')
const {GetUser,GetUsers,EditUser,DeleteUser,AddUser,CheckLogin} = require('./modules/Users.js');
const {selectWordOfToday,getTimeUntilNextMidnight} = require('./modules/wordPerDay.js');
const {GetLeaderBoard,AddToLeaderboard,EditLeaderboard,DeleteFromLeaderboard} = require('./modules/leaderboard.js');

dotenv.config();

const apiKeys = process.env.API_KEYS.replace(" ","").split(",");
const OurGames = process.env.OUR_GAMES.replace(" ","").split(",");


const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


const ApiKeyMiddleware = (req, res, next) => {
  const providedApiKey = req.headers['x-api-key'];

  if (!apiKeys.includes(providedApiKey)) {
    return res.status(401).json({ error: 'Unauthorized. Invalid API key.' });
  }

  next();
};
const GameExist = (req, res, next) => {
  const Game = req.params['Game'];
  if (!OurGames.includes(Game)) {
    return res.status(401).json({ error: 'Game does not exist.' });
  }

  next();
};

const CheckContentType = (req, res, next) => {
    if (req.headers['content-type'] !== 'application/json') {
      return res.status(415).send('Unsupported Media Type');
  }
  next();
};

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

router.use(async(req,res,next) => {
  try {
    const webhookUrl = 'https://discord.com/api/webhooks/1217783886797606992/dQVKsMXmYMJUFYik45egxMsfkriTQn4NkERZr2GgWHXwD3YtD7bM-tJ_wc96iy0vw1S8';
    const messagePayload = {
      embeds: [
        {
          title: 'Api logging',
          description: 'These are logs of the requests made to our api',
          color: 16711680, // Hex color code, e.g., red
          fields: [
            {
              name: 'Time',
              value: new Date(),
              inline: false 
            },
            {
              name: 'Request method',
              value: req.method,
              inline: true
            },
            {
              name: 'Request URL',
              value: req.url,
              inline: true
            },
            {
              name: 'Request ip',
              value: req.ip,
              inline: false
            }
          ]
        }
      ]
    }
      const response = await axios.post(webhookUrl, messagePayload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
  console.log(new Date(),req.method,req.url);
  next();
});

//USER ROUTES

router.post('/:Game/AddUser', GameExist,CheckContentType, (req, res) => {
  let { Name, Email, Password } = req.body;
  const Game = req.params['Game'];
  AddUser(Name, Email, Password,Game, res);
});

router.post('/:Game/EditUser',GameExist,CheckContentType, (req, res) => {
  const {Name, Email, Password, Token} = req.body;
  const Game = req.params['Game'];
  EditUser(Name, Email, Password, Token, Game, res);
});

router.post('/:Game/DeleteUser',GameExist,CheckContentType, (req, res) => {
  const {Token} = req.body;
  const Game = req.params['Game'];
  DeleteUser(Token,Game, res);
});

router.get('/:Game/GetUser',GameExist,CheckContentType, (req, res) => {
  const {Token} = req.body;
  const Game = req.params['Game'];
  GetUser(Token,Game, res);
});

router.get('/:Game/GetUsers',GameExist,CheckContentType, (req, res) => {
  const Game = req.params['Game'];
  GetUsers(Game,res);
});
router.post('/:Game/Login',GameExist,CheckContentType, (req, res) => {
  const {Email, Password} = req.body;
  const Game = req.params['Game'];
  CheckLogin(Email, Password,Game, res);
});

//LEADERBOARD ROUTES

router.post('/:Game/AddLeaderboard', GameExist,CheckContentType, (req, res) => {
  const {Token, Score } = req.body;
  AddToLeaderboard(Token, Score, res);
});

router.post('/:Game/EditLeaderboard',GameExist,CheckContentType, (req, res) => {
  const {Score, Token} = req.body;
  EditLeaderboard(Score, Token,res);
});

router.post('/:Game/DeleteLeaderboard',GameExist,CheckContentType, (req, res) => {
  const {id} = req.body;
  const Game = req.params['Game'];
  DeleteFromLeaderboard(id,Game, res);
});

router.get('/:Game/GetLeaderboard',GameExist,CheckContentType, (req, res) => {
  const Game = req.params['Game'];
  GetLeaderBoard(Game, res);
});

// make a router for if there is nothign it just returns a 404
router.get('/', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});


//WORDLE WORD ROUTES

let wordOfToday = selectWordOfToday();

setTimeout(function() {
    wordOfToday = selectWordOfToday();
    setInterval(function() {
        wordOfToday = selectWordOfToday();
    }, 86400000);

}, getTimeUntilNextMidnight());

router.get('/:Game/Word',GameExist,(req,res,next) => {
    res.json({ message:wordOfToday});
  next();
});

app.use('/',ApiKeyMiddleware,limiter,router);

// create server
const server = http.createServer(app);

// listen on port
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});