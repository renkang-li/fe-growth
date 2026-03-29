import cors from "cors";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, "data", "store.json");
const PORT = 3001;

const app = express();

app.use(cors());
app.use(express.json());

const readStore = async () => {
  const raw = await fs.readFile(STORE_PATH, "utf8");
  return JSON.parse(raw);
};

const writeStore = async (data) => {
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
};

const getUserId = (req) => req.header("x-user-id") || req.query.userId || "u1";

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mall-api", now: new Date().toISOString() });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "username 和 password 必填" });
  }

  const store = await readStore();
  const user = store.users.find(
    (item) => item.username === username && item.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "账号或密码错误" });
  }

  return res.json({
    token: `mock-token-${user.id}`,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname
    }
  });
});

app.get("/api/categories", async (_req, res) => {
  const store = await readStore();
  res.json(store.categories);
});

app.get("/api/products", async (req, res) => {
  const store = await readStore();
  const { keyword = "", categoryId = "", sort = "", page = "1", pageSize = "10" } = req.query;
  let list = [...store.products];

  if (keyword) {
    const kw = String(keyword).toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw)
    );
  }

  if (categoryId) {
    list = list.filter((item) => item.categoryId === categoryId);
  }

  if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
  if (sort === "sales_desc") list.sort((a, b) => b.sales - a.sales);

  const current = Math.max(Number(page) || 1, 1);
  const size = Math.max(Number(pageSize) || 10, 1);
  const total = list.length;
  const start = (current - 1) * size;
  const data = list.slice(start, start + size);

  res.json({
    page: current,
    pageSize: size,
    total,
    list: data
  });
});

app.get("/api/products/:id", async (req, res) => {
  const store = await readStore();
  const product = store.products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ message: "商品不存在" });
  res.json(product);
});

app.get("/api/cart", async (req, res) => {
  const userId = String(getUserId(req));
  const store = await readStore();
  const cart = store.carts[userId] || [];

  const items = cart
    .map((item) => {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        ...item,
        product,
        amount: product.price * item.quantity
      };
    })
    .filter(Boolean);

  const totalAmount = items
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + item.amount, 0);

  res.json({ userId, items, totalAmount });
});

app.post("/api/cart", async (req, res) => {
  const userId = String(getUserId(req));
  const { productId, quantity = 1 } = req.body || {};
  if (!productId) return res.status(400).json({ message: "productId 必填" });

  const store = await readStore();
  const product = store.products.find((item) => item.id === productId);
  if (!product) return res.status(404).json({ message: "商品不存在" });

  if (!store.carts[userId]) store.carts[userId] = [];
  const target = store.carts[userId].find((item) => item.productId === productId);
  if (target) {
    target.quantity += Number(quantity) || 1;
  } else {
    store.carts[userId].push({
      productId,
      quantity: Math.max(Number(quantity) || 1, 1),
      checked: true
    });
  }

  await writeStore(store);
  res.status(201).json({ message: "已加入购物车" });
});

app.patch("/api/cart/:productId", async (req, res) => {
  const userId = String(getUserId(req));
  const { productId } = req.params;
  const { quantity, checked } = req.body || {};

  const store = await readStore();
  if (!store.carts[userId]) store.carts[userId] = [];
  const target = store.carts[userId].find((item) => item.productId === productId);
  if (!target) return res.status(404).json({ message: "购物车条目不存在" });

  if (quantity !== undefined) target.quantity = Math.max(Number(quantity) || 1, 1);
  if (checked !== undefined) target.checked = Boolean(checked);

  await writeStore(store);
  res.json({ message: "购物车已更新" });
});

app.delete("/api/cart/:productId", async (req, res) => {
  const userId = String(getUserId(req));
  const { productId } = req.params;

  const store = await readStore();
  const current = store.carts[userId] || [];
  store.carts[userId] = current.filter((item) => item.productId !== productId);
  await writeStore(store);

  res.json({ message: "已从购物车移除" });
});

app.post("/api/orders", async (req, res) => {
  const userId = String(getUserId(req));
  const { address = "", paymentMethod = "alipay", note = "" } = req.body || {};

  const store = await readStore();
  const cart = (store.carts[userId] || []).filter((item) => item.checked);
  if (!cart.length) {
    return res.status(400).json({ message: "没有可结算的商品" });
  }

  const orderItems = cart.map((item) => {
    const product = store.products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      title: product?.title || "未知商品",
      price: product?.price || 0,
      quantity: item.quantity
    };
  });

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: `o${Date.now()}`,
    userId,
    status: "pending",
    address,
    paymentMethod,
    note,
    items: orderItems,
    totalAmount,
    createdAt: new Date().toISOString()
  };

  store.orders.unshift(order);
  store.carts[userId] = (store.carts[userId] || []).filter((item) => !item.checked);
  await writeStore(store);

  res.status(201).json(order);
});

app.get("/api/orders", async (req, res) => {
  const userId = String(getUserId(req));
  const store = await readStore();
  const list = store.orders.filter((item) => item.userId === userId);
  res.json(list);
});

app.get("/api/orders/:id", async (req, res) => {
  const userId = String(getUserId(req));
  const store = await readStore();
  const order = store.orders.find(
    (item) => item.id === req.params.id && item.userId === userId
  );
  if (!order) return res.status(404).json({ message: "订单不存在" });
  res.json(order);
});

app.use((_req, res) => {
  res.status(404).json({ message: "API Not Found" });
});

app.listen(PORT, () => {
  console.log(`Mall API is running on http://localhost:${PORT}`);
});
