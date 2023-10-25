import { container, singleton } from 'tsyringe';
import * as typeorm from 'typeorm';
import { constructor } from 'tsyringe/dist/typings/types/index.js';
import * as path from 'path';

@singleton()
export class Database {
  readonly dataSource = new typeorm.DataSource({
    type: 'better-sqlite3',
    database: './storage/db.sqlite',
    entities: [path.resolve(process.cwd(), './dist/**/*.entity.js')],
    synchronize: true,
  });

  async init(): Promise<this> {
    await this.dataSource.initialize();

    return this;
  }

  makeEntitiesInjectable(): this {
    if (!this.dataSource.isInitialized) {
      throw new Error(
        'Database is not initialized! Please use Database.init()',
      );
    }

    this.dataSource.entityMetadatas.forEach((entity) => {
      const entityClass = entity.target as constructor<typeof entity.target>;

      container.register(entityClass, {
        useValue: this.dataSource.getRepository(
          entity.target,
        ) as unknown as typeof entityClass,
      });
    });

    return this;
  }
}
