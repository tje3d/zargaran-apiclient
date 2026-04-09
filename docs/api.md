# Moamelat Trading Platform - API Documentation

## Overview
Build a modern, responsive frontend for a gold trading platform. The platform allows traders to:
- Authenticate via phone/password
- View real-time gold prices
- Open/close trades (buy/sell gold)
- Manage TP/SL (Take Profit/Stop Loss)
- View trade history
- Manage pending orders
- Deposit/withdraw funds
- KYC verification

## Base URL
```
Production: https://api.moamelat.com
Development: http://localhost:3000
```

## Authentication
All protected routes require `x-token` header:
```
x-token: {trader_id}:{random_hash}
```

---

## API Endpoints

### 1. Authentication (`/auth`)

#### 1.1 Get Trader by Identifier
Check if a trader exists before login.

```
GET /auth/trader?identifier={chat_id_or_phone}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trader": {
      "id": 123,
      "chat_id": "987654321",
      "tell": "09123456789",
      "fullname": "John Doe",
      "has_password": true
    }
  }
}
```

#### 1.2 Login with Password
```
POST /auth/login/password
Content-Type: application/json

{
  "id": "09123456789",     // phone number or chat_id
  "password": "userpass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "123:abc123def456...",
    "trader": {
      "id": 123,
      "tell": "09123456789",
      "fullname": "John Doe",
      "nickname": "john_trader"
    }
  }
}
```

#### 1.3 Login with Username
```
POST /auth/login/username
Content-Type: application/json

{
  "username": "09123456789",
  "password": "userpass123"
}
```

#### 1.4 Send Verification Code
```
POST /auth/send-code
Content-Type: application/json

{
  "trader_id": 123,
  "type": "set_password"   // set_password | reset_password
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mobile": "0912***6789",
    "trader_id": 123
  }
}
```

#### 1.5 Verify Code
```
POST /auth/verify-code
Content-Type: application/json

{
  "trader_id": 123,
  "code": "12345",
  "type": "set_password"
}
```

#### 1.6 Set Password (with verification)
```
POST /auth/set-password
Content-Type: application/json

{
  "trader_id": 123,
  "password": "newpass123",
  "code": "12345"
}
```

#### 1.7 Request Change Password (Protected)
```
POST /auth/change-password/request
x-token: {token}
Content-Type: application/json

{
  "new_password": "newpass456"
}
```

#### 1.8 Change Password (Protected)
```
POST /auth/change-password
x-token: {token}
Content-Type: application/json

{
  "new_password": "newpass456",
  "code": "54321"
}
```

---

### 2. Trader Profile (`/trader`)

#### 2.1 Get Profile
```
GET /trader/profile
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "tell": "09123456789",
    "nickname": "john_trader",
    "fullname": "John Doe",
    "margin": 1500.00,
    "leverage": 3,
    "commission": 0.5,
    "obligation_status": "none",
    "deposit_type": "irt",
    "unique_code": "1234",
    "sell_count": 45,
    "buy_count": 32,
    "sell_avg": 1850.50,
    "buy_avg": 1845.25,
    "call_margin_price": {
      "sell": 1200.00,
      "buy": 1100.00
    }
  }
}
```

#### 2.2 Get Open Trades
```
GET /trader/open-trades
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": 456,
        "type": "buy",
        "amount": 5,
        "price": 1850.25,
        "remain_amount": 5,
        "pnl": 125.50
      }
    ],
    "totalPnl": 125.50,
    "buyCount": 32,
    "sellCount": 45,
    "buyAvg": 1845.25,
    "sellAvg": 1850.50,
    "currentBuyPrice": 1875.00,
    "currentSellPrice": 1870.00
  }
}
```

#### 2.3 Get Capacity
```
GET /trader/capacity?rate={optional_price}
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rate": 1875.00,
    "loss": 0,
    "freeMargin": 500.00,
    "leverage": 3,
    "buy": 150,
    "sell": 150
  }
}
```

#### 2.4 Get Referral Info
```
GET /trader/referral
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "active": true,
    "referralCount": 5,
    "totalIncome": 250.00,
    "link": "https://t.me/bot?start=dGoxMzQ1Njc4OQ=="
  }
}
```

#### 2.5 Edit Nickname
```
POST /trader/edit-nickname
x-token: {token}
Content-Type: application/json

{
  "nickname": "new_nickname"
}
```

---

### 3. Trading (`/trader`)

#### 3.1 Open Market Trade (Instant)
```
POST /trader/trade
x-token: {token}
Content-Type: application/json

{
  "type": "buy",      // buy | sell
  "amount": 5         // 1-500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "result": {
      "trade_id": 789
    }
  }
}
```

**Error Codes:**
- `MARKET_CLOSED` - Market is deactivated
- `BOT_DISABLED` - Bot is deactivated
- `BROKER_CLOSED` - Broker is closed
- `RATE_LIMITED` - Too many requests (1 min cooldown)
- `ACCOUNT_CLOSE_ONLY` - Account can only close trades
- `INVALID_TYPE` - Type must be 'buy' or 'sell'
- `INVALID_AMOUNT` - Amount must be positive
- `AMOUNT_TOO_LARGE` - Max 500 per trade
- `INSUFFICIENT_CREDIT` - Not enough margin (includes allowed amount)
- `OPEN_TRADES_LIMIT` - Max open trades reached
- `TRADE_FAILED` - General failure

#### 3.2 Close Trade
```
POST /trader/close
x-token: {token}
Content-Type: application/json

{
  "trade_id": 456
}
```

#### 3.3 Close All Trades
```
POST /trader/close-all
x-token: {token}
Content-Type: application/json

{
  "type": "all"     // all | buy | sell | profit | loss
}
```

#### 3.4 Change Leverage
```
POST /trader/leverage
x-token: {token}
Content-Type: application/json

{
  "leverage": 3     // 1-5 (or max_users_leverage)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "newLeverage": 3,
    "callMarginSell": 1200.00,
    "callMarginBuy": 1100.00
  }
}
```

---

### 4. TP/SL Management (`/trader`)

#### 4.1 Update TP/SL
```
POST /trader/tpsl
x-token: {token}
Content-Type: application/json

{
  "trade_id": 456,
  "tp": 1900.00,     // 0 to remove
  "sl": 1800.00      // 0 to remove
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "action": "created"   // created | updated | deleted
  }
}
```

**Error Codes:**
- `TRADE_NOT_FOUND` - Trade doesn't exist or closed
- `NO_PRICE_AVAILABLE` - Real-time price unavailable
- `INVALID_DECIMAL` - Decimals must be multiple of 5
- `TP_TOO_CLOSE` - TP too close to current price
- `SL_TOO_CLOSE` - SL too close to current price
- `PENDING_DISABLED` - Pending orders disabled

#### 4.2 Get Pending Orders
```
GET /trader/pending?status=new,step1
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 789,
        "trade_id": 456,
        "type": "buy",
        "order_type": "tpsl",
        "number": 5,
        "price": 1850.00,
        "base_price": 1875.00,
        "tp": 1900.00,
        "sl": 1800.00,
        "status": "step1",
        "date": 1712345678
      }
    ]
  }
}
```

#### 4.3 Cancel Pending Order
```
POST /trader/pending/cancel
x-token: {token}
Content-Type: application/json

{
  "pending_id": 789
}
```

---

### 5. Trade History (`/trader`)

#### 5.1 Get Trade History
```
GET /trader/history?page=1&limit=20&type=buy&from_date=1711929600&to_date=1712016000
x-token: {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `type` - Filter by type: `buy` | `sell`
- `from_date` - Unix timestamp
- `to_date` - Unix timestamp

**Response:**
```json
{
  "success": true,
  "data": {
    "trades": [
      {
        "id": 456,
        "type": "buy",
        "amount": 5,
        "price": "1850.25",
        "close_price": "1875.50",
        "time": 1712345678,
        "close_time": 1712432078,
        "pnl": "125.50",
        "commission_amount": "2.50"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 6. Accounting (`/accounting`)

#### 6.1 Get Margin/Balance
```
GET /accounting/margin
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "margin": 1500.00,
    "blocked": 200.00,
    "available": 1300.00
  }
}
```

#### 6.2 Get Transactions
```
GET /accounting/transactions?page=1&limit=20
x-token: {token}
```

#### 6.3 Get Deposit Constraints
```
GET /accounting/deposit/constraints
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "used": 5000000,
    "limit": 50000000,
    "remain": 45000000,
    "countUsed": 2,
    "countLimit": 5,
    "countRemain": 3
  }
}
```

#### 6.4 Get Withdraw Constraints
```
GET /accounting/withdraw/constraints?card_number={optional}
x-token: {token}
```

#### 6.5 Deposit IRT (Toman)
```
POST /accounting/deposit/irt
x-token: {token}
Content-Type: application/json

{
  "amount": 1000000,
  "gateway": "zibal"
}
```

#### 6.6 Deposit USDT
```
POST /accounting/deposit/usdt
x-token: {token}
Content-Type: application/json

{
  "amount": 100.00,
  "tx_id": "0xabc123..."
}
```

#### 6.7 Withdraw
```
POST /accounting/withdraw
x-token: {token}
Content-Type: application/json

{
  "amount": 50.00,
  "type": "send",        // send | neodigi | usdt
  "card_number": "6037991234567890"
}
```

---

### 7. KYC (`/kyc`)

#### 7.1 Get KYC Status
```
GET /kyc/status
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending",    // none | pending | approved | rejected
    "steps": {
      "step1": true,
      "step2": true,
      "step3": false
    }
  }
}
```

#### 7.2 Submit KYC Step 1 (Personal Info)
```
POST /kyc/step1
x-token: {token}
Content-Type: multipart/form-data

{
  "fullname": "John Doe",
  "national_id": "0012345678",
  "birth_date": "1370/01/01"
}
```

#### 7.3 Submit KYC Step 2 (ID Card)
```
POST /kyc/step2
x-token: {token}
Content-Type: multipart/form-data

{
  "id_card_front": <file>,
  "id_card_back": <file>
}
```

#### 7.4 Submit KYC Step 3 (Selfie)
```
POST /kyc/step3
x-token: {token}
Content-Type: multipart/form-data

{
  "selfie": <file>
}
```

---

### 8. Cards (`/card`)

#### 8.1 List Cards
```
GET /card/list
x-token: {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": 1,
        "bank": "Mellat",
        "number": "603799****7890",
        "shaba": "IR****1234567890",
        "status": "success"
      }
    ]
  }
}
```

#### 8.2 Add Card
```
POST /card/add
x-token: {token}
Content-Type: application/json

{
  "bank": "Mellat",
  "number": "6037991234567890",
  "shaba": "IR123456789012345678901234"
}
```

#### 8.3 Delete Card
```
POST /card/delete
x-token: {token}
Content-Type: application/json

{
  "card_id": 1
}
```

---

## Real-Time Data

### WebSocket Connection
Connect to receive real-time price updates:

```javascript
const ws = new WebSocket('wss://api.moamelat.com/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // data = { buy: 1875.00, sell: 1870.00, avg: 1872.50 }
};
```

### Redis Pub/Sub (Alternative)
Prices are published to Redis channel `ounce_rate`:
```json
{
  "rate_buy": "1875.00",
  "rate_sell": "1870.00",
  "price": "1872.50"
}
```

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "ERROR_CODE",
  "data": {},
  "errors": {}
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (invalid/expired token)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Frontend Requirements

### 1. Authentication Flow
- Login page with phone/chat_id + password
- Password setup flow with SMS verification
- Password reset flow
- Session management with token storage

### 2. Dashboard
- Real-time gold price display (buy/sell)
- Account summary (margin, PnL, leverage)
- Quick trade buttons (buy/sell)
- Open trades list with PnL

### 3. Trading Interface
- Open trade modal (type, amount)
- Close trade confirmation
- TP/SL management interface
- Trade history with filters and pagination

### 4. Account Management
- Profile editing (nickname)
- Leverage adjustment
- Referral link sharing

### 5. Financial Operations
- Deposit (IRT gateway, USDT)
- Withdraw (card selection, amount)
- Transaction history

### 6. KYC Verification
- Multi-step form
- Document upload
- Status tracking

### 7. Card Management
- Add/remove bank cards
- Card list display

---

## UI/UX Guidelines

### Design System
- Modern, clean interface
- RTL support for Persian/Farsi
- Responsive design (mobile-first)
- Dark/Light theme support

### Color Coding
- **Buy/Long**: Green (#22c55e)
- **Sell/Short**: Red (#ef4444)
- **Profit**: Green text
- **Loss**: Red text
- **Warning**: Yellow/Orange
- **Success**: Green

### Key Components
- Price ticker with live updates
- Trade cards with PnL indicators
- Action buttons with loading states
- Toast notifications for feedback
- Confirmation modals for destructive actions
- Form validation with Persian error messages

### Persian Number Formatting
Display all numbers in Persian numerals (1234567890 -> 1234567890) using a utility function.

---

## State Management

### Required State
```typescript
interface AppState {
  auth: {
    token: string | null;
    trader: Trader | null;
    isAuthenticated: boolean;
  };
  prices: {
    buy: number;
    sell: number;
    avg: number;
    lastUpdate: Date;
  };
  trades: {
    openTrades: Trade[];
    history: PaginatedResult<Trade>;
    pendingOrders: PendingOrder[];
  };
  account: {
    margin: number;
    transactions: PaginatedResult<Transaction>;
  };
  kyc: {
    status: KycStatus;
  };
  cards: Card[];
}
```

---

## Implementation Notes

1. **Token Storage**: Store token in localStorage or secure cookie
2. **Token Refresh**: Implement token refresh before expiry
3. **Error Handling**: Show Persian error messages from API
4. **Rate Limiting**: Handle 429 errors with retry logic
5. **Price Updates**: Reconnect WebSocket on disconnect
6. **Form Validation**: Validate on client before API calls
7. **Loading States**: Show spinners during API calls
8. **Optimistic Updates**: Update UI immediately, revert on error

---

## Tech Stack Recommendations

- **Framework**: React 18+ or Next.js 14+
- **State**: Zustand or React Query
- **UI**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios or Fetch
- **WebSocket**: Native WebSocket or Socket.io
- **i18n**: next-intl or react-intl (Persian locale)
