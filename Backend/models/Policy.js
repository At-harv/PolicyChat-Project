import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Policy = sequelize.define("Policy", {
  policyName: { type: DataTypes.STRING, allowNull: false },
  policyNumber: { type: DataTypes.STRING, allowNull: false },
  insuranceCompany: { type: DataTypes.STRING, allowNull: false },
  policyType: { type: DataTypes.STRING },
  premiumAmount: { type: DataTypes.FLOAT },
  premiumFrequency: { type: DataTypes.STRING },
  coverageAmount: { type: DataTypes.FLOAT },
  status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  notes: { type: DataTypes.TEXT },
  documents: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  userId: { type: DataTypes.INTEGER, allowNull: false },
});
