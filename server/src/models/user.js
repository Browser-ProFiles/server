module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        username: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        email: {
            type: Sequelize.STRING(255),
            allowNull: false
        },

        password: {
            type: Sequelize.STRING,
            allowNull: false
        },

        subscriptionActiveUntil: {
            type: Sequelize.INTEGER,
            allowNull: true
        },

        ip: {
            type: Sequelize.STRING(64),
            allowNull: true
        },
        details: {
            type: Sequelize.STRING(512),
            allowNull: true
        },
    });

    return User;
};
