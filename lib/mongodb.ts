import mongoose from "mongoose";
import dns from "node:dns";

const MONGODB_URI = process.env.MONGODB_URI;

// `mongodb+srv://` requires a DNS SRV lookup before connecting. On some
// Windows/VPN/Docker setups Node's resolver (c-ares) inherits a dead nameserver
// (often 127.0.0.1), so the lookup fails with "querySrv ECONNREFUSED" even
// though the OS resolver and public DNS work. Pinning known-good public
// resolvers ahead of whatever the OS handed us fixes it without changing the
// connection string. Public resolvers are reachable here (verified); the OS
// servers stay as fallback in case the host only resolves Atlas privately.
try {
  const existing = dns.getServers();
  dns.setServers([...new Set(["1.1.1.1", "8.8.8.8", ...existing])]);
} catch {
  /* setServers only throws on malformed addresses — safe to ignore */
}

/**
 * Cache the connection across hot reloads in development and across
 * lambda invocations in production, so we don't open a new connection
 * on every request.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};
global._mongooseCache = cached;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local file."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      // Fail in ~10s instead of the 30s default so a bad network/DNS surfaces fast.
      serverSelectionTimeoutMS: 10_000,
      // Force IPv4: some Windows/VPN setups refuse the IPv6 resolver path, which
      // shows up as "querySrv ECONNREFUSED" on mongodb+srv:// URIs.
      family: 4,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw enrichConnectionError(err);
  }

  return cached.conn;
}

/**
 * Turn opaque driver DNS failures into an actionable message. A `mongodb+srv://`
 * URI needs a DNS SRV lookup before it can connect; when that lookup is refused
 * the raw error ("querySrv ECONNREFUSED") gives no hint that it's a local DNS
 * problem rather than a wrong password or a down cluster.
 */
function enrichConnectionError(err: unknown): unknown {
  const msg = err instanceof Error ? err.message : String(err);
  if (/querySrv|ECONNREFUSED|ENOTFOUND|ENODATA|EAI_AGAIN/i.test(msg)) {
    return new Error(
      `MongoDB DNS lookup failed (${msg}). Node could not resolve the cluster's ` +
        `SRV record. This is usually a local DNS/VPN issue, not your credentials. ` +
        `Try setting a working resolver (dns.setServers(["1.1.1.1"])) or switch ` +
        `MONGODB_URI to the non-SRV "mongodb://host1,host2,host3/..." form.`,
      { cause: err }
    );
  }
  return err;
}
