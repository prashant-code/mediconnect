import { Logger } from './logger';

export function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    Logger.info(`[${target.constructor.name}] Entering method: ${propertyKey}`);
    const start = Date.now();
    try {
      const result = await originalMethod.apply(this, args);
      const end = Date.now();
      Logger.info(`[${target.constructor.name}] Exiting method: ${propertyKey} - Execution time: ${end - start}ms`);
      return result;
    } catch (error) {
      const end = Date.now();
      Logger.error(`[${target.constructor.name}] Error in method: ${propertyKey} - Execution time: ${end - start}ms`, error);
      throw error;
    }
  };

  return descriptor;
}
