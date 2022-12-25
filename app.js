const express = require('express');
const path = require('path');
const app = express();

app.set('port', process.env.PORT || 3000);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(app.get('port'), () => {
    console.log(`3000 번 포트로 서버가 실행됩니다.`);
});