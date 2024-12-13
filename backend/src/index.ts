import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import passport from "passport";

import "./auth-strategies/local-strategy";
import authenticationMiddleware from "./middlewares/authenticationMiddleware";
import AccountService from "./utils/AccountService";
import { hashPassword } from "./utils/credentialUtils";

const app = express();
const PORT = process.env.SERVER_PORT_NUMBER || 5000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your session secret key here",
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 60000 * 60,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.post(
  "/api/auth/login",
  passport.authenticate("local"),
  (req: Request, res: Response) => {
    res.send();
  }
);

app.post(
  "/api/auth/logout",
  authenticationMiddleware,
  (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.sendStatus(400);
      }
      res.send();
    });
  }
);

app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { username, password } = <{ username: string; password: string }>(
    req.body
  );

  const hashedPassword = await hashPassword(password);

  const accountService = new AccountService(process.env.CSV_FILE_PATH || "");
  // TODO: check if users exists first before adding new row!
  await accountService.createAccount(username, hashedPassword);

  res.send();
});

// example to show user object that can be accessed via req.user
// authenticationMiddleware checks if that object exists first
app.get(
  "/api/protected",
  authenticationMiddleware,
  (req: Request, res: Response) => {
    console.log("User requesting the action: ", req.user);
    res.send("Entered a protected route!");
  }
);

// example to show that if authenticationMiddleware is not added
// anyone can call this API
app.get("/api/unprotected", (req: Request, res: Response) => {
  res.send("Entered an unprotected route!");
});

// async custom error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
