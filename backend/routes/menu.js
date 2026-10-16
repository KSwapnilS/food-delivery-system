const router = require("express").Router();
const MenuItem = require("../models/MenuItem");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", async (req, res, next) => {
  try {
    res.json(await MenuItem.find({ available: true }).sort("category name"));
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await MenuItem.create(req.body));
  } catch (e) {
    if (e.name === "ValidationError") return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Menu item not found" });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
