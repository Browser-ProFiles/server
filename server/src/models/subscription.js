module.exports = (sequelize, Sequelize) => {
    const Subscription = sequelize.define('subscriptions', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
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
