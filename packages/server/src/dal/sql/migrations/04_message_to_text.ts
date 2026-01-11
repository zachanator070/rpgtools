import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration to change the message column in the Messages table to TEXT type.
 */
async function up({ context: queryInterface }: {context: QueryInterface}) {
  await queryInterface.changeColumn('Message', 'message', {
    type: DataTypes.TEXT,
    allowNull: false,
  });
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
  await queryInterface.changeColumn('Message', 'message', {
    type: DataTypes.STRING(512),
    allowNull: false,
  });
}

export {up, down};
