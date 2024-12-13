import passport from "passport";
import { Strategy } from "passport-local";

import User from "../types/User";
import AccountService from "../utils/AccountService";
import { comparePassword } from "../utils/credentialUtils";

// after login, store the username in request.user
passport.serializeUser((user, cb) => {
  cb(null, (user as User).username);
});

// using the user ID, retrieve the user object
passport.deserializeUser(async (username: string, cb) => {
  try {
    const accountService = new AccountService(process.env.CSV_FILE_PATH || "");

    // search for users in CSV, if not found throw error
    const users: User[] = await accountService.getAccounts();

    // assume username is unique and not case sensitive
    const foundUser = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (!foundUser) {
      throw new Error("User Not Found");
    }

    cb(null, foundUser);
  } catch (err) {
    cb(err);
  }
});

export default passport.use(
  new Strategy(async (username, password, cb) => {
    try {
      const accountService = new AccountService(
        process.env.CSV_FILE_PATH || ""
      );

      // search for users in CSV, if not found throw error
      const users: User[] = await accountService.getAccounts();

      // assume username is unique and not case sensitive
      const foundUser = users.find(
        (user) => user.username.toLowerCase() === username.toLowerCase()
      );

      if (!foundUser) {
        throw new Error("Incorrect username or password");
      }

      const passwordMatches = await comparePassword(
        password,
        foundUser.password
      );

      if (!passwordMatches) {
        throw new Error("Incorrect username or password");
      }

      cb(null, foundUser);
    } catch (error) {
      cb(error);
    }
  })
);
