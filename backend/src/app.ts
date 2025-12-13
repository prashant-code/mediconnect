import express, { Express } from 'express';
import middlewareLoader from './startup/middleware';
import routesLoader from './startup/routes';

const app: Express = express();

middlewareLoader(app);
routesLoader(app);

export default app;
