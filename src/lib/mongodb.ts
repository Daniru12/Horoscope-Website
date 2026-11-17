import mongoose from "mongoose";
import { promises as dnsPromises } from "node:dns";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Some local networks (ISP/router/VPN DNS) cannot resolve MongoDB Atlas hostnames,
 * which shows up as `querySrv ECONNREFUSED` / `ENOTFOUND`. In development we resolve
 * Atlas through public DNS ourselves, without touching Windows network settings:
 *   1. turn the `mongodb+srv://` URI into a plain `mongodb://` host list (SRV + TXT),
 *   2. give the driver a `lookup` function that resolves each host via public DNS.
 * Production (e.g. Vercel) has working DNS, so the URI is used unchanged there.
 */
const resolver = new dnsPromises.Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);

async function expandSrvUri(uri: string): Promise<string> {
  const m = uri.match(/^mongodb\+srv:\/\/([^@]+@)?([^/?]+)\/?([^?]*)\??(.*)$/);
  if (!m) return uri;
  const [, credentials = "", host, dbName, query] = m;

  const [srv, txt] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${host}`),
    resolver.resolveTxt(host).catch(() => [] as string[][]),
  ]);

  const hosts = srv.map((r) => `${r.name}:${r.port}`).join(",");
  const params = new URLSearchParams(txt.map((chunks) => chunks.join("")).join("&"));
  new URLSearchParams(query).forEach((v, k) => params.set(k, v));
  if (!params.has("tls") && !params.has("ssl")) params.set("tls", "true");

  return `mongodb://${credentials}${hosts}/${dbName}?${params.toString()}`;
}

function publicDnsLookup(hostname: string, options: any, callback: any) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  resolver
    .resolve4(hostname)
    .then((addresses) => {
      if (options?.all) callback(null, addresses.map((address) => ({ address, family: 4 })));
      else callback(null, addresses[0], 4);
    })
    .catch((err) => callback(err));
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn("Please define the MONGODB_URI environment variable inside .env. Build may proceed if this is a static phase.");
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
      throw new Error("Please define the MONGODB_URI environment variable inside .env");
    }
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isDev = process.env.NODE_ENV !== "production";
    cached.promise = (async () => {
      const uri = isDev ? await expandSrvUri(MONGODB_URI!) : MONGODB_URI!;
      const opts: Record<string, unknown> = { bufferCommands: false };
      if (isDev) opts.lookup = publicDnsLookup;
      return mongoose.connect(uri, opts);
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
