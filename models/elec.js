/* eslint-disable no-unused-vars */
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class elec extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      elec.belongsTo(models.admin, {
        foreignKey: "adminId",
      });
    }

    static async createelec({ name, adminId }) {
      return this.create({ name: name, adminId: adminId });
    }

    static async allelec(id) {
      return this.findAll({
        where: {
          adminId: id,
        },
      });
    }
  }
  elec.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "elec",
    }
  );
  return elec;
};
