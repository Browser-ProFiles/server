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
            type: Sequelize.STRING(255),
            allowNull: false
        },

        status: {
            type: Sequelize.STRING(16),
            allowNull: false
        },

        confirmToken: {
            type: Sequelize.STRING(255),
            allowNull: true
        },

        subscriptionActiveUntil: {
            type: Sequelize.STRING(32),
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
