import { Router } from 'express'
import passport from 'passport'
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth'

import configuration from './configuration'

// http://passportjs.org/docs/google
passport.use(new GoogleStrategy({
    clientID:       configuration.get('google_oauth2:client_id'),
    clientSecret:   configuration.get('google_oauth2:client_secret'),
    callbackURL:    configuration.get('google_oauth2:callback_url')
  },
  (accessToken, refreshToken, profile, done) => {
    let allowedEmail = null;
    profile.emails.map((eml) => {
      if (eml.value && (eml.type == 'account' || eml.verified === true)) {
        if (configuration.get('allowed_emails').indexOf(eml.value) != -1) {
          console.info(`E-mail ${eml.value} is listed in allowed_emails`);
          allowedEmail = eml.value;
        }
      }
    });
    if (allowedEmail) {
      return done(null, {
        displayName: profile.displayName,
        email: allowedEmail,
      });
    } else {
      console.info('User not allowed:', profile)
      return done("Not allowed", null);
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user);
})

passport.deserializeUser((user, done) => {
  done(null, user);
})

export function setupServer(server) {
  server.use(passport.initialize());
  server.use(passport.session());
}

export const authRouter = Router();

authRouter.get('/auth/google/',
  passport.authenticate('google', {
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]
  }));

authRouter.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const url = req.session.redirectAfterLogin;
    req.session.redirectAfterLogin = null;
    res.redirect(url || '/');
  });
