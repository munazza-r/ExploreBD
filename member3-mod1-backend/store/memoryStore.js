const fs = require('fs');
const path = require('path');

const dataDirectory = path.join(__dirname, '..', 'data');
const databasePath = path.join(dataDirectory, 'local-db.json');
const temporaryDatabasePath = `${databasePath}.tmp`;

const usersByEmail = new Map();
const usersById = new Map();
const guideProfilesByUserId = new Map();

function loadLocalData() {
  if (!fs.existsSync(databasePath)) return;

  try {
    const data = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
    for (const user of data.users || []) {
      usersByEmail.set(user.email, user);
      usersById.set(user.id, user);
    }
    for (const profile of data.guideProfiles || []) {
      guideProfilesByUserId.set(profile.userId, profile);
    }
  } catch (error) {
    console.warn(`Local data warning: ${error.message}`);
  }
}

function persistLocalData() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const data = JSON.stringify({
    users: [...usersById.values()],
    guideProfiles: [...guideProfilesByUserId.values()]
  }, null, 2);
  fs.writeFileSync(temporaryDatabasePath, data, { mode: 0o600 });
  fs.renameSync(temporaryDatabasePath, databasePath);
}

function saveUser(user) {
  usersByEmail.set(user.email, user);
  usersById.set(user.id, user);
  persistLocalData();
  return user;
}

function saveGuideProfile(profile) {
  guideProfilesByUserId.set(profile.userId, profile);
  persistLocalData();
  return profile;
}

loadLocalData();

module.exports = {
  usersByEmail,
  usersById,
  guideProfilesByUserId,
  saveUser,
  saveGuideProfile
};
