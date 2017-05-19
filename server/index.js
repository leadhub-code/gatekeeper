const express = require('express')
const next = require('next')

const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

// http://passportjs.org/docs/google
passport.use(new GoogleStrategy({
    clientID:       process.env.GOOGLE_CLIENT_ID,
    clientSecret:   process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:    process.env.GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
      /*
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user)
      })
      */
      console.info('profile:', profile)
      return done(null, { name: 'sample user' })
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
    secret: 'keybkasohvfjvjkzxhv',
    resave: false,
    saveUninitialized: true,
  }))
  server.use(passport.initialize())
  server.use(passport.session())

  server.get('/auth/google/',
    passport.authenticate('google', {
      scope: [
        //'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/plus.profile.emails.read',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ]
    }))

  server.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/')
    })

  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
