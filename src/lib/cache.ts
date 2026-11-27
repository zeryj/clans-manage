interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}


const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Mengambil data dari cache jika belum kedaluwarsa.
 * @param key Kunci cache unik
 * @returns Data cache atau null jika tidak ada/kedaluwarsa
 */
export function getCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Menyimpan data ke dalam cache dengan durasi TTL tertentu.
 * @param key Kunci cache unik
 * @param data Data yang ingin disimpan
 * @param ttlSeconds Masa aktif cache dalam detik (default: 180 detik / 3 menit)
 */
export function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = 180,
): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Menghapus cache berdasarkan kunci tertentu.
 */
export function deleteCache(key: string): void {
  memoryCache.delete(key);
}

/**
 * Membersihkan semua cache yang tersimpan.
 */
export function clearCache(): void {
  memoryCache.clear();
}
