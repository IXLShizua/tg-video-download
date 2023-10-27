import { container, singleton } from 'tsyringe';
import * as typeorm from 'typeorm';
import { constructor } from 'tsyringe/dist/typings/types/index.js';
import * as path from 'path';
import { Logger } from '#src/common/logger/logger';

@singleton()
export class Database {
  private readonly logger = new Logger('Database');

  readonly dataSource = new typeorm.DataSource({
    type: 'better-sqlite3',
    database: './storage/db.sqlite',
    entities: [path.resolve(process.cwd(), './dist/**/*.entity.js')],
    synchronize: true,
  });

  async init(): Promise<this> {
    await this.dataSource.initialize();

    this.logger.info(`Database (${this.dataSource.options.type}) initialized.`);

    return this;
  }

  makeEntitiesInjectable(): this {
    if (!this.dataSource.isInitialized) {
      this.logger.error(
        'Database is not initialized! Please use Database.init()',
      );
      process.exit(1);
    }

    this.dataSource.entityMetadatas.forEach((entity) => {
      const entityClass = entity.target as constructor<typeof entity.target>;

      container.register(entityClass, {
        useValue: this.dataSource.getRepository(
          entity.target,
        ) as unknown as typeof entityClass,
      });
    });

    this.logger.info('All entities have been made injectable.');

    return this;
  }
}
