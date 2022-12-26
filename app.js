const express = require('express');
const path = require('path');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');

app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'));
app.use(express.static('public')); // 미들웨어간에 순서 중요.. 요청한 파일이 존재하면 여기서 응답을 한다.
app.use(cookieParser('zerochoSecret'));
app.use(express.json()); // body-parser 대신에 (express 에 포함됨.)
app.use(express.urlencoded({ extended: true }));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'zerochoSecret',
    cookie: {
        httpOnly: true,
    },
    name: 'connect.sid',
}));
app.use(multer().array());

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
    //  // session 사용법
    req.session.id = 'hello'; // 요청한 사람만 hello 가 생김.

    // // cookie-parser 사용법
    // req.cookies;
    // req.signedCookies;
    // res.cookies('name', encodeURIComponent(name), {
    //     expires: new Date(),
    //     httpOnly: true,
    //     path: '/',
    // })
    // res.clearCookie('name', encodeURIComponent(name), {
    //     httpOnly: true,
    //     path: '/',
    // })
    //
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

// ## CH 6-6 Middleware 라이브러리 적용 1
// morgan 요청, 응답 로그
// cookie-parser 쿠키를 쉽게 다룰수 있다.
// body-parser express 에 포함됨. 더 이상 사용하지 않음.
//  * express.json(); // JSON 타입
//  * express.urlencoded({ extended: true }); // FORM 타입 true 몇 qs, false 면 querystring / 이미지는 처리 못 함 다른 라이브러리

// ## CH 6-7 Middleware 라이브러리 적용 2
// express.static('public') // 정적 파일 (js, css, ...)
//  * app.use(express.static('public'));
//  * app.use('/요청경로', express.static(__dirname, 'public'));
//  * 요청한 파일이 존재하면 여기서 응답하고 끝.. (존재하면 응답, 없으면 next() 하여 다음 미들웨어로...)

// ## CH 6-8 Middleware 라이브러리 적용 2
// express-session // 세션 처리
//
// ### 미들웨어 확장 하기
// ```
// app.use('/', (req, res, next) => {
// if (req.session.id) {
//     express.static(__dirname, 'public')(req, res, next);
// } else {
//     next();
// }
// });
// ```

// 팁
// 미들웨어간 데이터 전달하기
// `req` 나 `res` 객체 안에 값을 넣어 데이터 전달 가능
// * app.set 과의 차이점: app.set 은 서버 내내 유지, req, res 는 요청 하나 동안만 유지
// * req.body 나 req.cookies 같은 미들웨어의 데이터와 겹치지 않게 조심
// ```
// app.use((req, res, next) => {
//     // req.session.data = '데이터 넣기'; // 계정에 대한 영구 저장
//     req.data = '데이터 넣기'; // 하나의 요청 한정
//     next();
// }, (req, res, next) => {
//     console.log(req.data); // 데이터 받기
//     next();
// });
// ```

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