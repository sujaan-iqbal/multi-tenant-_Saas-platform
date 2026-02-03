const  express= require('express');
const app= express();

app.use(express.json());

app.get('/', (req, res)=>{
    res.json({message: `server is working`})
});
module.exports= app;