// Adds sample menu items and an admin user:  npm run seed  (node seed.js)
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const MenuItem = require("./models/MenuItem");
const User = require("./models/User");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await MenuItem.deleteMany({});
  await MenuItem.insertMany([
    { name: "Margherita Pizza", description: "Classic cheese pizza", price: 249, category: "Pizza" },
    { name: "Veg Burger", description: "Crispy veg patty burger", price: 129, category: "Burgers" },
    { name: "Paneer Biryani", description: "Aromatic basmati rice", price: 199, category: "Rice" },
    { name: "Cold Coffee", description: "Chilled and creamy", price: 99, category: "Drinks" },
  ]);
  if (!(await User.findOne({ email: "admin@example.com" })))
    await User.create({ name: "Admin", email: "admin@example.com", password: await bcrypt.hash("admin123", 10), role: "admin" });
  console.log("Seeded. Admin login: admin@example.com / admin123 (change for any real use)");
  process.exit(0);
})();
