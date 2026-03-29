# Mall API (Mock)

## Start

```bash
npm run api
```

Base URL: `http://localhost:3001`

Demo user:

- `username`: `demo`
- `password`: `123456`

## Common Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/categories`
- `GET /api/products?keyword=&categoryId=&sort=&page=&pageSize=`
- `GET /api/products/:id`
- `GET /api/cart` (`x-user-id` header optional, default `u1`)
- `POST /api/cart`
- `PATCH /api/cart/:productId`
- `DELETE /api/cart/:productId`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`

## Request Examples

```bash
curl http://localhost:3001/api/products
```

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo\",\"password\":\"123456\"}"
```

```bash
curl -X POST http://localhost:3001/api/cart \
  -H "Content-Type: application/json" \
  -H "x-user-id: u1" \
  -d "{\"productId\":\"p2001\",\"quantity\":1}"
```
