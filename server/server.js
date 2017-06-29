import express from 'express'
import next from 'next'

import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import session from 'express-session'

import passport from 'passport'
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'

import configuration from './configuration'
import api from './api'

// make it easily stoppable if running inside Docker container
Array.from(["SIGINT", "SIGTERM"]).map((sig) => {
  process.on(sig, () => {
    process.exit();
  })
});

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
    console.info('req:', req.user || '-', req.method, req.url);
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

  server.use(api);

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
