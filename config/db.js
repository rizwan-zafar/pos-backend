const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "mysql",
    logging: false, // You can set this to true if you want to see SQL queries in the console
     // ✅ Use the socket path here if using XAMPP or MAM
     dialectOptions: {
      socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock' // Replace with your actual path
    }
  }
);

try {
  sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

module.exports = sequelize;
