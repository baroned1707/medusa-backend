import express, { Router } from "express";
import payment from "./payment";
import upload from "./upload";
import path from "path";

export default (rootDirectory) => {
  const router = Router();

  router.use(express.json());

  router.use(express.static(path.join(process.cwd(), "uploads")));

  payment(router);
  upload(router, rootDirectory);

  return router;
};
