import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        await connectToDatabase();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user || !user.password) {
          throw new Error("User not found or using OAuth");
        }
        
        const isPasswordMatch = await bcrypt.compare(credentials.password as string, user.password);
        
        if (!isPasswordMatch) {
          throw new Error("Invalid password");
        }
        
        const isAdmin = user.email === 'subarathnayaka21@gmail.com';
        if (isAdmin && user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        } as any;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        try {
          const existingUser = await User.findOne({ email: user.email });
          const isAdmin = user.email === 'subarathnayaka21@gmail.com';
          
          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name || profile?.name,
              googleId: account.providerAccountId,
              image: user.image,
              role: isAdmin ? 'admin' : 'user'
            });
          } else if (isAdmin && existingUser.role !== 'admin') {
            existingUser.role = 'admin';
            await existingUser.save();
          }
          return true;
        } catch (error) {
          console.error("Error saving user", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        if (user.image) token.image = user.image;
        if ((user as any).role) token.role = (user as any).role;
      }
      if (account?.provider === "google") {
        await connectToDatabase();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          if (dbUser.image) token.image = dbUser.image;
        }
      } else if (user) {
        const dbUser = await User.findById(user.id);
        if(dbUser) {
          token.role = dbUser.role;
          if (dbUser.image) token.image = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.image) session.user.image = token.image;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
