import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Logger } from './logger';

const exporter = new PrometheusExporter({
  port: 9464,
});

const sdk = new NodeSDK({
  metricReader: exporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy instrumentations to keep metrics clean
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
    }),
    new PrismaInstrumentation(),
  ],
});

export const initTelemetry = () => {
  sdk.start();
  Logger.info('OpenTelemetry initialized');
  
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => Logger.info('OpenTelemetry terminated'))
      .catch((error) => Logger.error('Error terminating OpenTelemetry', error))
      .finally(() => process.exit(0));
  });
};
