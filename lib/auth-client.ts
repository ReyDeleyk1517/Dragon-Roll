import { createAuthClient } from "better-auth/react";
import dns from "node:dns/promises";




export const { signIn, signUp, signOut, useSession } = createAuthClient();