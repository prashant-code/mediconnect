import app from './app';
import dotenv from 'dotenv';
import { Logger } from './utils/logger';
import { initTelemetry } from './utils/telemetry';

initTelemetry();
dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  Logger.info(`Server running on port ${PORT}`);
});

const gracefulShutdown = () => {
  Logger.info('Received kill signal, shutting down gracefully');
  server.close(() => {
    Logger.info('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    Logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
