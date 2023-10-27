import constructor from 'tsyringe/dist/typings/types/constructor.js';
import { GlobalLogger } from '#src/common/logger/logger';

export function InjectRepository(
  entity: constructor.default<any>,
): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ): void => {
    const targetMetadata = Reflect.getMetadata('design:paramtypes', target);

    if (!targetMetadata[parameterIndex]) {
      GlobalLogger.error(
        `Not found metadata or property in constructor for ${entity.name}`,
      );
      process.exit(1);
    }

    targetMetadata[parameterIndex] = entity;

    Reflect.defineMetadata('design:paramtypes', targetMetadata, target);
  };
}
