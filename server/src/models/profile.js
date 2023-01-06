module.exports = (sequelize, Sequelize) => {
    const Profile = sequelize.define('profiles', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        name: {
            type: Sequelize.VARCHAR(255),
            allowNull: false,
        },
        options: {
            type: Sequelize.TEXT,
            allowNull: false,
        }
    });

    return Profile;
};
