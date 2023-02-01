module.exports = (sequelize, Sequelize) => {
    const Subscription = sequelize.define('subscriptions', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING(32),
            allowNull: false,
        },
        maxProfiles: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    });

    return Subscription;
};
