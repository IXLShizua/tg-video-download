import { constructor } from 'tsyringe/dist/typings/types/index.js';

export function InjectRepository(entity: constructor<any>): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ): void => {
    const targetMetadata = Reflect.getMetadata('design:paramtypes', target);
    targetMetadata[parameterIndex] = entity;

    Reflect.defineMetadata('design:paramtypes', targetMetadata, target);
  };
}
