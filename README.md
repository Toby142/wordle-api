# API Documentation
## Introductie
Dit is een documentatie over onze wordle API. Bij deze API zijn inbegrepen het user management, een leaderboard en een woord van de dag voor de game wordle. Bij deze API heb je een request limit van 100 per 5 minuten. Dit kan altijd worden aangepast in overleg. Ook heb je voor deze API een API-key nodig die je kunt opvragen bij ons. Voor verdere informatie wijzen wij u naar onze documentatie of neemt u contact met ons op.

## Gebruikshandleiding
De API gebruik je door een post of get request te maken naar de url `https://www.ONZEWEBSITE.nl/YOUR_GAME/Functie` bij dit request verwacht onze API een api-key en de correcte parameters. De parameters en soort request kun je vinden onder het kop Request. Ook verwacht onze api dat je met het juiste content type aankomt genaamd: application/json. Hierdoor zal hij ook alleen maar post request accepteren die dit mee sturen stuur je dit niet mee zal api u request afwijzen. Hierdoor kunt u ook verwacht dat onze respons altijd een JSON is. mocht dit niet het geval zijn horen wij hier graag over van u terug.

## Requests

| Endpoint                   | Method | Body Parameters             |
|----------------------------|--------|-----------------------------|
| /YOUR_GAME/AddLeaderboard  | POST   | Token, Score                |
| /YOUR_GAME/AddUser         | POST   | Name, Email, Password      |
| /YOUR_GAME/DeleteLeaderboard | POST  | Id                          |
| /YOUR_GAME/DeleteUser      | POST   | Token                       |
| /YOUR_GAME/EditLeaderboard | POST   | Score, Token                |
| /YOUR_GAME/EditUser        | POST   | Name, Email, Password, Token |
| /YOUR_GAME/GetLeaderboard  | GET    | N/A                         |
| /YOUR_GAME/GetUser         | GET    | Token                       |
| /YOUR_GAME/GetUsers        | GET    | N/A                         |
| /YOUR_GAME/Login           | POST   | Email, Password             |
| /YOUR_GAME/Word            | GET    | N/A                         |


