import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration to add tokenId and tokenType fields to the InGameModel table.
 * These fields allow positioned models in games to reference a TokenIcon and specify a token type.
 */
async function up({ context: queryInterface }: {context: QueryInterface}) {
  await queryInterface.addColumn('GameModel', 'tokenId', {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'TokenIcon',
      key: '_id'
    }
  });

  await queryInterface.addColumn('GameModel', 'tokenType', {
    type: DataTypes.STRING,
    allowNull: true
  });
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
  await queryInterface.removeColumn('GameModel', 'tokenType');
  await queryInterface.removeColumn('GameModel', 'tokenId');
}

export {up, down};
