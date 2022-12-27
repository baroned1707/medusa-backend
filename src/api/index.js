import payment from "./payment";
import express, { Router } from "express";

export default () => {
  const router = Router();

  router.use(express.json());

  payment(router);

  return router;
};
