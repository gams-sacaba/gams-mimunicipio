import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

export function configureAppMiddlewares(app) {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: true,
      saveUninitialized: true,
    }),
  );
  app.set("trust proxy", true);
}
