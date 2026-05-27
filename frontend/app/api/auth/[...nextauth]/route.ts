import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({

  secret: process.env.NEXTAUTH_SECRET,

  providers: [

    GoogleProvider({

      clientId: process.env.GOOGLE_CLIENT_ID!,

      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.send",
        },
      },

    }),

  ],

  callbacks: {

    async jwt({ token, account }) {

      if (account) {
        token.accessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }) {

      session.accessToken = token.accessToken as string;

      return session;
    },

  },

});

export { handler as GET, handler as POST };