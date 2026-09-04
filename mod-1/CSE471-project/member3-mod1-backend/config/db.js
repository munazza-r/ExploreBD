const mongoose = require('mongoose');
const dns = require('dns');

function configuredMongoDns() {
  const servers = String(process.env.MONGO_DNS_SERVERS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
  return servers;
}

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    throw new Error('MONGO_URI (or DATABASE_URL) is missing. Add it to the backend .env file.');
  }

  const configuredServers = configuredMongoDns();
  let conn;
  try {
    conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  } catch (error) {
    const srvResolverRefused = mongoUri.startsWith('mongodb+srv://') &&
      ['EREFUSED', 'ECONNREFUSED'].includes(error.code) && configuredServers.length === 0;
    if (!srvResolverRefused) throw error;

    console.warn('System DNS refused the MongoDB Atlas SRV lookup; retrying with public DNS resolvers.');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  }
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

module.exports = connectDB;
