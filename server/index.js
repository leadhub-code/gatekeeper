const express = require('express')
const next = require('next')

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

const AWS = require('aws-sdk')

require("babel-register");

// make it easily stoppable if running inside Docker container
["SIGINT", "SIGTERM"].map((sig) => {
  process.on(sig, () => {
    process.exit();
  })
});

const configuration = require('./configuration').default

AWS.config.credentials = new AWS.Credentials({
  accessKeyId: configuration.get('aws:access_key_id'),
  secretAccessKey: configuration.get('aws:access_key_secret'),
});

const s3 = new AWS.S3();

console.info()

// http://passportjs.org/docs/google
passport.use(new GoogleStrategy({
    clientID:       configuration.get('google_oauth2:client_id'),
    clientSecret:   configuration.get('google_oauth2:client_secret'),
    callbackURL:    configuration.get('google_oauth2:callback_url')
  },
  function(accessToken, refreshToken, profile, done) {
    let allowedEmail = null;
    profile.emails.map((eml) => {
      if (eml.value && eml.type == 'account') {
        if (configuration.get('allowed_emails').indexOf(eml.value) != -1) {
          console.info(`E-mail ${eml.value} is listed in allowed_emails`);
          allowedEmail = eml.value;
        }
      }
    });
    if (allowedEmail) {
      // console.info('profile:', profile)
      return done(null, { displayName: profile.displayName, email: allowedEmail });
    } else {
      console.info('User not allowed:', profile)
      return done("Not allowed", null);
    }
  }
))

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(user, done) {
  done(null, user)
})

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
.then(() => {
  const server = express()

  server.use(cookieParser())
  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(bodyParser.json())
  server.use(session({
    secret: configuration.get('session_secret'),
    resave: false,
    saveUninitialized: true,
  }))
  server.use(passport.initialize())
  server.use(passport.session())

  server.use((req, res, next) => {
    req.siteTitle = configuration.get('site_title') || 'Gatekeeper';
    next();
  })

  server.get('/auth/google/',
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ]
    }))

  server.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/')
    })

  //server.get('/debug', (req, res) => res.json(req.user))

  server.get('/api/s3/prefixes', (req, res) => {
    if (!req.user) {
      res.redirect('/');
    }
    const s3bucketName = configuration.get('aws:s3_bucket');
    const prefixesWithIndex = [];

    const listFolders = (prefix) => {
      const listParams = {
        'Bucket': s3bucketName,
        'Delimiter': '/',
        'Prefix': prefix,
      }
      return s3.listObjectsV2(listParams).promise().then((listData) => {
        //console.info(prefix, JSON.stringify(listData));
        const contents = listData['Contents'];
        if (contents) {
          const keys = contents.map((x) => x['Key']);
          const filenames = keys.map((k) => k.split('/').reverse()[0]);
          const hasIndex = filenames.findIndex((s) => s == 'index.html') !== -1;
          if (hasIndex) {
            prefixesWithIndex.push(prefix);
            return;
          }
        }
        if (listData['CommonPrefixes']) {
          const promises = listData['CommonPrefixes'].map((cp) => {
            return listFolders(cp['Prefix']);
          });
          return Promise.all(promises);
        }
      });
    };

    listFolders('').then((data) => {
      //console.info('done', data);
      //console.info('prefixesWithIndex:', JSON.stringify(prefixesWithIndex));
      res.json({ prefixesWithIndex });
    }).catch((err) => {
      console.info(req.path, 'err:', err);
      res.status(500).send('Error: ' + JSON.stringify(err));
    });
  });

  server.get('/s3/*', (req, res) => {
    if (!req.user) {
      res.redirect('/');
    }
    let path = req.path.substr(4);
    if (path.endsWith('/')) {
      path += 'index.html';
    }
    const s3bucketName = configuration.get('aws:s3_bucket');
    const params = {
      'Bucket': s3bucketName,
      'Key': path,
    }
    s3.getObject(params).promise().then((data) => {
      //console.info(data);
      if (data['ContentType']) {
        res.set('Content-Type', data['ContentType'])
      }
      if (data['Body']) {
        res.send(data['Body'])
      } else {
        res.json({ data });
      }
    }).catch((err) => {
      res.status(500).send('Error: ' + JSON.stringify(err));
    })
  });

  server.get('/', (req, res) => {
    if (req.user) {
      return app.render(req, res, '/dashboard', req.query);
    } else {
      return app.render(req, res, '/login', req.query);
    }
  })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(3000, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:3000 (pid ${process.pid})`)
  })
})
