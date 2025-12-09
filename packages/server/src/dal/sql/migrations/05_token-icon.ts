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
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.dropTable('TokenIcon');
}

export {up, down};
