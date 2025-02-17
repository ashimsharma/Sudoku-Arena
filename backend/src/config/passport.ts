import passport from "passport";
import { Profile, Strategy } from "passport-github2";
import prisma from "../db";

passport.use(
  new Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: process.env.GITHUB_CALLBACK_URL as string,
    },
    async (
      accessToken: String,
      refreshToken: String,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        let user = await prisma.user.findUnique({
          where: { email: profile.emails?.[0].value },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0].value || "",
              name: profile.displayName,
              avatarUrl: profile.photos?.[0].value,
            },
          });
        }

        done(null, user);
      } catch (error) {}
    }
  )
);

export default passport;
