import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/user.js'; // Adjust the path as necessary
import dotenv from 'dotenv';
dotenv.config();
   
export const passportStrategies = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
        async (accessToken, refreshToken, profile, done) => {
          console.log(profile)
       
          try {
            if (!profile) {
            return
          }
          let user = await User.findOne({ where: {username:profile.displayName } });
          if (!user) {
            user = await User.create({
                username: profile.displayName,
                email: profile.email,
                userImage: profile.picture,
                password: profile.id, 
                signedWith:profile.provider
            });
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
                  console.log(profile)
  
        try {
                if (!profile) {
            return
          }
          let user = await User.findOne({ where: { username:profile.username } });
          if (!user) {
            user = await User.create({
            username: profile.username,
            email: profile.emails[0].value,
            userImage: profile._json.avatar_url,
            bio:profile._json.bio,
            signedWith: profile.provider,
                    password: profile?.id,
            });
          }
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
};