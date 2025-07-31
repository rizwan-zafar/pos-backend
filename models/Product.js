const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Review = require("./Reviews");

const Product = sequelize.define(
  "product",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    price_usd: {
      type: DataTypes.FLOAT,
      allowNull: true, 
    },
    promo_price_pkr: {
      type: DataTypes.FLOAT,
      allowNull: true, 
      defaultValue: 0,
    },
    promo_price_usd: {
      type: DataTypes.FLOAT,
      allowNull: true, 
    },
    delivery: {
      type: DataTypes.FLOAT,
      allowNull: true, 
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Show", "Hide"),
      defaultValue: "Show",
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Category",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "User",
        key: "id",
      },
    },
    parent: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    children: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0,
    },
    gallery: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "[]",
    },
    brand:{
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "No Brand",
    },
    productCode: {
      type: DataTypes.STRING(50),
      allowNull: false, 
      unique: true, 
    },
    variations: {
      type: DataTypes.JSON, 
      allowNull: true,
      defaultValue: [], 
    },
  },
  {
    sequelize,
    timestamps: true,
    modelName: "Product",
  }
);

Product.associate = (models) => {
  Product.belongsTo(models.Category, {
    foreignKey: "category_id",
    as: "category",
  });
  
  Product.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};



// Relation with Review
Product.hasMany(Review, { foreignKey: "productId" });
Review.belongsTo(Product, { foreignKey: "productId" ,  as: "product"});

// Relation with User
const User = require('./User');
Product.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = Product;
