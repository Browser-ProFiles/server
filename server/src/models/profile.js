module.exports = (sequelize, Sequelize) => {
    const Profile = sequelize.define('profiles', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING(255),
            allowNull: false,
        },
        options: {
            type: Sequelize.TEXT,
            allowNull: false,
        }
    });

    return Profile;
};
