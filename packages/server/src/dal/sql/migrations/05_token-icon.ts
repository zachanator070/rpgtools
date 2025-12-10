import {DataTypes, ModelAttributes, QueryInterface} from "sequelize";

const defaultAttributes: ModelAttributes = {
    _id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
};

async function up({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.createTable('TokenIcon', {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        imageId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Image',
                key: '_id'
            }
        },
        worldId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'World',
                key: '_id'
            }
        }
    });

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
    await queryInterface.dropTable('TokenIcon');
    await queryInterface.removeColumn('GameModel', 'tokenType');
    await queryInterface.removeColumn('GameModel', 'tokenId');
}

export {up, down};
