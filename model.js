const {Sequelize, DataTypes} = require("sequelize");
const sequelize = new Sequelize("foldersync', 'root', 'password");

const MySqlSchema = sequelize.define("folder_list", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: DataTypes.TEXT,
    location:DataTypes.TEXT,
    type:DataTypes.TEXT,
    createdDate: DataTypes.DATETIME,
    modifiedDate: DataTypes.DATETIME,
    size : DataTypes.INTEGER
}, {});

return sequelize.authenticate()
    .then(result => {
        console.log(`MySql successfully connected!`);
        return MySqlSchema.sync();
    })
    .then(result => {
        console.log(`folder_list table created`);
        return result;
    })
    .catch(error => {
        console.error('Unable to connect to MySql database:', error);
    })
