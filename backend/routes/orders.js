const router = require("express").Router();
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Place an order. Prices are read from the database, never trusted from the client.
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { items, address } = req.body;
    if (!Array.isArray(items) || items.length === 0 || !address)
      return res.status(400).json({ error: "Items and delivery address are required" });

    const lines = [];
    let total = 0;
    for (const { menuItemId, quantity } of items) {
      const qty = Number(quantity);
      if (!Number.isInteger(qty) || qty < 1)
        return res.status(400).json({ error: "Quantity must be a positive whole number" });
      const m = await MenuItem.findById(menuItemId);
      if (!m || !m.available) return res.status(400).json({ error: "Menu item unavailable" });
      lines.push({ menuItem: m._id, name: m.name, price: m.price, quantity: qty });
      total += m.price * qty;
    }
    const order = await Order.create({ user: req.user.id, items: lines, total, address });
    res.status(201).json(order);
  } catch (e) {
    next(e);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.user.id }).sort("-createdAt"));
  } catch (e) {
    next(e);
  }
});

router.get("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    res.json(await Order.find().populate("user", "name email").sort("-createdAt"));
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (e) {
    if (e.name === "ValidationError") return res.status(400).json({ error: e.message });
    next(e);
  }
});

module.exports = router;
