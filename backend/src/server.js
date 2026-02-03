const app= require('./app')
const PORT=  process.env.Port ||3000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});