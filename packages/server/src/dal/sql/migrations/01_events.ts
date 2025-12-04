import {DataTypes, ModelAttributes, QueryInterface} from "sequelize";

async function up({ context: queryInterface }: {context: QueryInterface}) {
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

    await queryInterface.createTable('Calendar', {
            ...defaultAttributes,
            name: {
                type: DataTypes.STRING
            },
            worldId: {
                type: DataTypes.UUID,
                references: {
                    model: 'World',
                    key: '_id'
                }
            }
        });
    await queryInterface.createTable('Event', {
            ...defaultAttributes,
            calendarId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Calendar',
                    key: '_id'
                }
            },
            age: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            year: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            month: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            day: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            hour: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            minute: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            second: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
        });
    await queryInterface.createTable('Age', {
            ...defaultAttributes,
            name: {
                type: DataTypes.STRING
            },
            index: {
                type: DataTypes.INTEGER
            },
            numYears: {
                type: DataTypes.INTEGER
            },
            calendarId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Calendar',
                    key: '_id'
                }
            }
        });
    await queryInterface.createTable('Month', {
            ...defaultAttributes,
            name: {
                type: DataTypes.STRING
            },
            numDays: {
                type: DataTypes.INTEGER
            },
            index: {
                type: DataTypes.INTEGER
            },
            ageId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Age',
                    key: '_id'
                }
            }
        });
    await queryInterface.createTable('DayOfTheWeek', {
            ...defaultAttributes,
            name: {
                type: DataTypes.STRING
            },
            index: {
                type: DataTypes.INTEGER
            },
            ageId: {
                type: DataTypes.UUID,
                references: {
                    model: 'Age',
                    key: '_id'
                }
            }
        });
}

async function down({ context: queryInterface }: {context: QueryInterface}) {
    await queryInterface.dropTable('Event');
    await queryInterface.dropTable('Calendar');
    await queryInterface.dropTable('Age');
    await queryInterface.dropTable('Month');
    await queryInterface.dropTable('DayOfTheWeek');
}

export {up, down};