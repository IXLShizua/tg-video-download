import { access, mkdir } from 'fs/promises';

export async function createStorage(): Promise<void> {
  access('./storage').catch((e) => {
    if (e.code === 'ENOENT') return mkdir('./storage', { recursive: true });

    throw e;
  });
}
