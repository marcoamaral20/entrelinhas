export function createRedisConnectionOptions(redisUrl: string) {
  const parsedUrl = new URL(redisUrl);

  return {
    db: parsedUrl.pathname ? Number(parsedUrl.pathname.slice(1)) || 0 : 0,
    host: parsedUrl.hostname,
    password: parsedUrl.password || undefined,
    port: parsedUrl.port ? Number(parsedUrl.port) : 6379,
    username: parsedUrl.username || undefined,
  };
}
