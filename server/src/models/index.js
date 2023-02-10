const config = require('../config/db.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        operatorsAliases: false,

        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('../models/user.js')(sequelize, Sequelize);
db.role = require('../models/role.js')(sequelize, Sequelize);
db.profile = require('../models/profile.js')(sequelize, Sequelize);
db.subscription = require('../models/subscription.js')(sequelize, Sequelize);
db.payment = require('../models/payment.js')(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
    through: 'user_roles',
    foreignKey: 'roleId',
    otherKey: 'userId'
});

db.user.belongsToMany(db.role, {
    through: 'user_roles',
    foreignKey: 'userId',
    otherKey: 'roleId'
});

db.user.belongsTo(db.subscription);

db.user.hasMany(db.profile);

db.profile.belongsTo(db.user);

/*db.track.hasMany(db.trackHistory, {
  foreignKey: 'id',
  otherKey: 'trackId'
});
db.trackHistory.belongsTo(db.track, {
  foreignKey: 'trackId',
  otherKey: 'id'
});*/

db.ROLES = ['user', 'admin'];

module.exports = db;
