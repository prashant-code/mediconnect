import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';

export default function (app: Express) {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}
