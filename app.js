const express = require('express');
const path = require('path');
const app = express();

app.set('port', process.env.PORT || 3000);

// app.use((req, res) => {
//     console.log('모든 요청에 실해하고 싶어요.');
// });
app.use((req, res, next) => {
    console.log('모든 요청에 실해하고 싶어요.');
    next();
}
// ,(req, res, next) => {
//     try {
//         console.log('에러 코드');
//         throw new Error('에러 코드');
//     } catch(error) {
//         next(error);
//         // 에러 발생시 `next(error)` 를 사용한다.
//         //  * argument 가 없는 경우 **다음 middleware**
//         //  * argument 가 있는 경우 **에러 처리 middleware**
//     }
// }
);

app.get('/error', (req, res) => {
    throw new Error();
})

app.get('/category/javascript', (req, res, next) => {
    // /category/javascript
    res.send('hello javascript');
});
app.get('/category/:name', (req, res) => {
    // /category/myname
    res.send('hello wildcard');
});
app.get('/category*', (req, res) => {
    // /category/myname/any/any
    // /categoryanyanyany
    res.send('hello * ');
});

app.get('/', (req, res, next) => {
    if (true) {
        next('route'); // true: 아래의 메소드(미들웨어) 가 실행됨 - res.json
    } else {
        next(); // false: 아래의 핸들러 처리가 실행됨. - res.sendFile
    }
}, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
    console.log('false');
});

app.get('/', (req, res) => {
    console.log('true');
    // res.sendFile(path.join(__dirname, 'index.html'));
    res.json({ hello: 'zerocho' });
    // res.render('index');

    console.log('hello zerocho'); // res.json 은 리턴이 아니다. 이 콘솔도 실행됨.
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((req, res, next) => {
    res.status(404).send('404 ?');
});

app.use((err, req, res, next) => {
    res.status(500).send('에러가 발생...');
})

app.listen(app.get('port'), () => {
    console.log(`3000 번 포트로 서버가 실행됩니다.`);
});

// ## CH 6-5
// ### `next()` 를 호출해야 다음 코드로(넘어감)
// * next 를 주석 처리하면 응답이 전송되지 않음.
// * 다음 미들웨어(라우터 미들웨어)로 넘어가지 않기 때문
// * next 에 인수를 값을 넣으면 `에러 핸들러` 로 넘어감('route' 인 경우 다음 라우터로)
//
// 요청 -> morgan -next()-> static -next()-> json, urlencoded -next()-> cookieParser -next()-> 라우터 -next()-> 에러 처리 미들웨어 -> 응답
// * next() 다음 미들웨어로
// * next('router') 다음 라우터로
// * next(error) 에러 핸들러로

// ## CH 6-3
// ### app.use(...), app.get(...),
// * 공통으로 처리하고 싶은 내용(로직)있는 경우 <<-- 모든 요청에 대해서 (app.use(...))
// * 요청을 받는(Router) 모든 부분에서 공통 로직을 실행할 수 있다. `app.use(...)`
//  * **NodeJS 는 위에서 부터 밑으로 실행된다.** 하지만 `path` 가 맞지 않은 함수를 실행하지 않는다
//    또한 `next` 를 사용해야만 다음 미들웨어로 넘어간다.
//  * **함수의 위치가 중요하다.**
//   * `app.use(...)` 위에서 사용해야 모든 요청(라우터)에 적용된다.
//   * `app.get(category/:name)` and `app.get(category/javascript)`
//    * `/:wildcard(와일드카드)` 를 사용하는 경우에도 위치가 중요하다. (순서에 따라서 호출되는 함수가 다르다.
//    * `/:wildcard(와일드카드)` 를 사용하는 경우 보통은 그 경로를 사용하는 함수 마지막에 위치 시킨다.
//    * `*(애스터리스크)` 를 사용하는 경우 모든 요청에 대해서 처리를 한다는 뜻이다. (와일드카드는 path(/) 를 한다.)