const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const cookie = require('cookie');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.use(bodyParser.json());
app.use(cookieParser());
app.options(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://sub.local.host:3333");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.get('/', function(req, res) {
  const {
    hostOnly,
    sameSite,
    httpOnly,
  } = req.query;
  const token = new Date().getTime();
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', String(token), Object.assign({},
      {
        sameSite,
        httpOnly: !!httpOnly,
        maxAge: 60 * 60 * 24 * 7
      },
      hostOnly ? {} : { domain: 'local.host' },
    )),
  );
  res.send(`${token}`);
});

app.get('/link', function(req, res) {
  res.send(`
    <a href="http://local.host:3333/get">Link</a>
    <img src="http://local.host:3333/get" />
    <script>
      fetch('http://local.host:3333/get', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
      })
      .then(res => res.json())
      .then(console.log);
    </script>
  `);
});

app.get('/form', function(req, res) {
  res.send(`
    <input type="text" name="token" />
    <button onClick="callAPI()">Submit</button>
    <button onClick="overwriteCookie()">Overwrite Cookie</button>
    <div id="result"></div>
    <script>
      const tokenField = document.querySelector('input[name="token"]');
      tokenField.value = getToken() || '';
      function getToken() {
        return (document.cookie.match(/token=(\\d{1,})/) || []).pop();
      }
      function callAPI() {
        const result = document.querySelector('div#result');
        fetch('http://local.host:3333/post', {
          method: 'POST',
          body: JSON.stringify({ token: tokenField.value }),
          credentials: 'include',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(json => {
          result.innerText = JSON.stringify(json);
        })
        .catch(err => {
          result.innerText = JSON.stringify(err);
        });
      }
      function overwriteCookie() {
        document.cookie = document.cookie.replace(/(token)=(\\d{1,})/, \`$1=\${new Date().getTime()}; domain=local.host\`);;
        tokenField.value = getToken();
      }
    </script>
  `);
});


app.get('/get', function(req, res) {
  console.log(req.headers.referer, req.cookies);
  res.send({
    cookies: req.cookies,
  });
});

app.post('/post', function(req, res) {
  console.log(req.headers.referer, req.cookies, req.body);
  const { token: cookieToken } = req.cookies;
  const { token: bodyToken } = req.body;
  const statusCode = cookieToken === bodyToken ? 200 : 400;
  res.status(statusCode).send({
    success: cookieToken === bodyToken,
  });
});

http.listen(3333, () => {
  console.log('listening on *:3333');
});
