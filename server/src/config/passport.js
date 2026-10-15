import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

export const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('⚠️ Google OAuth credentials missing. Google login endpoint will be disabled.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.com`;
          const image = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

          const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          const isWhitelistedAdmin = adminEmails.includes(email.toLowerCase());

          let user = await User.findOne({ googleId: profile.id });
          if (!user && email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user && !user.googleId) {
              user.googleId = profile.id;
            }
          }

          if (user) {
            // Update profile info on login
            user.displayName = profile.displayName || user.displayName;
            user.image = image || user.image;
            if (isWhitelistedAdmin && user.role !== 'admin') {
              user.role = 'admin';
            }
            await user.save();
            return done(null, user);
          }

          const newUser = {
            googleId: profile.id,
            displayName: profile.displayName || 'Anonymous User',
            firstName: profile.name?.givenName || profile.displayName || 'User',
            lastName: profile.name?.familyName || '',
            email,
            image,
            role: isWhitelistedAdmin ? 'admin' : 'user',
          };

          user = await User.create(newUser);
          done(null, user);
        } catch (err) {
          console.error('Passport Google Strategy error:', err);
          done(err, null);
        }
      }
    )
  );
};
