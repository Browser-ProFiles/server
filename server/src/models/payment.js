module.exports = (sequelize, Sequelize) => {
    const Payment = sequelize.define('payments', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        subscriptionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        details: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        method: {
            type: Sequelize.STRING(16),
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING(16),
            allowNull: false,
        },
    });

    return Payment;
};
