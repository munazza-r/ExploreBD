// Single shared Prisma client for everything EXCEPT the User/auth system (which uses Mongoose - see config/db.js)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = prisma;
