import { access, writeFile } from 'fs/promises';

export async function createDatabase(): Promise<void> {
  access('./storage/db.sqlite').catch((e) => {
    if (e.code === 'ENOENT') return writeFile('./storage/db.sqlite', '');

    throw e;
  });
}
