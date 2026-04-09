// ==================== Types ====================

type TradeType = 'buy' | 'sell';
type CloseType = 'all' | 'buy' | 'sell' | 'profit' | 'loss';
type VerificationType = 'set_password' | 'reset_password';
type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';
type PendingStatus = 'new' | 'step1' | 'step2' | 'step3';
type ObligationStatus = 'none' | string;
type DepositType = 'irt' | string;
type CardStatus = 'success' | 'pending' | 'rejected' | string;
type OrderType = 'tpsl' | string;
type TpslAction = 'created' | 'updated' | 'deleted';
type WithdrawType = 'send' | 'neodigi' | 'usdt';
type GatewayType = 'zibal' | string;

// --- Auth ---

interface TraderIdentifier {
  id: number;
  chat_id: string;
  tell: string;
  fullname: string;
  has_password: boolean;
}

interface GetTraderResponse {
  trader: TraderIdentifier;
}

interface LoginResponse {
  token: string;
  trader: {
    id: number;
    tell: string;
    fullname: string;
    nickname: string;
  };
}

interface SendCodeResponse {
  mobile: string;
  trader_id: number;
}

interface VerifyCodeResponse {
  success: boolean;
}

// --- Profile ---

interface ProfileResponse {
  id: number;
  tell: string;
  nickname: string;
  fullname: string;
  margin: number;
  leverage: number;
  commission: number;
  obligation_status: ObligationStatus;
  deposit_type: DepositType;
  unique_code: string;
  sell_count: number;
  buy_count: number;
  sell_avg: number;
  buy_avg: number;
  call_margin_price: {
    sell: number;
    buy: number;
  };
}

// --- Trades ---

interface OpenTrade {
  id: number;
  type: TradeType;
  amount: number;
  price: number;
  remain_amount: number;
  pnl: number;
}

interface OpenTradesResponse {
  trades: OpenTrade[];
  totalPnl: number;
  buyCount: number;
  sellCount: number;
  buyAvg: number;
  sellAvg: number;
  currentBuyPrice: number;
  currentSellPrice: number;
}

interface CapacityResponse {
  rate: number;
  loss: number;
  freeMargin: number;
  leverage: number;
  buy: number;
  sell: number;
}

interface ReferralResponse {
  active: boolean;
  referralCount: number;
  totalIncome: number;
  link: string;
}

interface OpenTradeResponse {
  success: boolean;
  result: {
    trade_id: number;
  };
}

interface CloseTradeResponse {
  success: boolean;
}

interface CloseAllTradesResponse {
  success: boolean;
  closed: number;
}

interface LeverageResponse {
  success: boolean;
  newLeverage: number;
  callMarginSell: number;
  callMarginBuy: number;
}

// --- TP/SL ---

interface TpslResponse {
  success: boolean;
  action: TpslAction;
}

interface PendingOrder {
  id: number;
  trade_id: number;
  type: TradeType;
  order_type: OrderType;
  number: number;
  price: number;
  base_price: number;
  tp: number;
  sl: number;
  status: PendingStatus;
  date: number;
}

interface PendingOrdersResponse {
  orders: PendingOrder[];
}

interface CancelPendingResponse {
  success: boolean;
}

// --- History ---

interface TradeHistoryItem {
  id: number;
  type: TradeType;
  amount: number;
  price: string;
  close_price: string;
  time: number;
  close_time: number;
  pnl: string;
  commission_amount: string;
}

interface TradeHistoryResponse {
  trades: TradeHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface HistoryFilters {
  page?: number;
  limit?: number;
  type?: TradeType;
  from_date?: number;
  to_date?: number;
}

// --- Accounting ---

interface MarginResponse {
  margin: number;
  blocked: number;
  available: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  balance: number;
  date: number;
  description: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DepositConstraintsResponse {
  used: number;
  limit: number;
  remain: number;
  countUsed: number;
  countLimit: number;
  countRemain: number;
}

interface WithdrawConstraintsResponse {
  minAmount: number;
  maxAmount: number;
  fee: number;
  cards: Array<{
    id: number;
    bank: string;
    number: string;
  }>;
}

interface DepositResponse {
  success: boolean;
  url?: string;
  reference?: string;
}

interface WithdrawResponse {
  success: boolean;
  reference?: string;
}

// --- KYC ---

interface KycStatusResponse {
  status: KycStatus;
  steps: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
  };
}

interface KycStep1Data {
  [key: string]: string | File;
  fullname: string;
  national_id: string;
  birth_date: string;
}

interface KycStep2Data {
  [key: string]: string | File;
  id_card_front: File;
  id_card_back: File;
}

interface KycStep3Data {
  [key: string]: string | File;
  selfie: File;
}

interface KycResponse {
  success: boolean;
  message?: string;
}

// --- Cards ---

interface Card {
  id: number;
  bank: string;
  number: string;
  shaba: string;
  status: CardStatus;
}

interface CardListResponse {
  cards: Card[];
}

interface AddCardData {
  [key: string]: string;
  bank: string;
  number: string;
  shaba: string;
}

interface AddCardResponse {
  success: boolean;
  card?: Card;
}

interface DeleteCardResponse {
  success: boolean;
}

// --- Generic API Response ---

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, any>;
}

// ==================== Error Class ====================

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly code?: string,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ==================== Client ====================

interface ClientOptions {
  baseUrl?: string;
  token?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

const RETRYABLE_CODES = ['RATE_LIMITED', 'BOT_DISABLED'];
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

export class MoamelatClient {
  private baseUrl: string;
  private token: string | null;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? 'https://api.moamelat.com';
    this.token = options.token ?? null;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY;
  }

  // --- Token Management ---

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
  }

  // --- Auth Methods ---

  async getTrader(identifier: string): Promise<ApiResponse<GetTraderResponse>> {
    return this.request<GetTraderResponse>('GET', `/auth/trader?identifier=${encodeURIComponent(identifier)}`);
  }

  async loginByIdentifier(id: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('POST', '/auth/login/password', { body: { id, password } });
  }

  async loginByUsername(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('POST', '/auth/login/username', { body: { username, password } });
  }

  async sendCode(traderId: number, type: VerificationType): Promise<ApiResponse<SendCodeResponse>> {
    return this.request<SendCodeResponse>('POST', '/auth/send-code', { body: { trader_id: traderId, type } });
  }

  async verifyCode(traderId: number, code: string, type: VerificationType): Promise<ApiResponse<VerifyCodeResponse>> {
    return this.request<VerifyCodeResponse>('POST', '/auth/verify-code', { body: { trader_id: traderId, code, type } });
  }

  async setPassword(traderId: number, password: string, code: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/auth/set-password', { body: { trader_id: traderId, password, code } });
  }

  async requestChangePassword(newPassword: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/auth/change-password/request', { body: { new_password: newPassword }, auth: true });
  }

  async changePassword(newPassword: string, code: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/auth/change-password', { body: { new_password: newPassword, code }, auth: true });
  }

  // --- Profile Methods ---

  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.request<ProfileResponse>('GET', '/trader/profile', { auth: true });
  }

  async getOpenTrades(): Promise<ApiResponse<OpenTradesResponse>> {
    return this.request<OpenTradesResponse>('GET', '/trader/open-trades', { auth: true });
  }

  async getCapacity(rate?: number): Promise<ApiResponse<CapacityResponse>> {
    const query = rate !== undefined ? `?rate=${rate}` : '';
    return this.request<CapacityResponse>('GET', `/trader/capacity${query}`, { auth: true });
  }

  async getReferral(): Promise<ApiResponse<ReferralResponse>> {
    return this.request<ReferralResponse>('GET', '/trader/referral', { auth: true });
  }

  async editNickname(nickname: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/trader/edit-nickname', { body: { nickname }, auth: true });
  }

  // --- Trading Methods ---

  async openTrade(type: TradeType, amount: number): Promise<ApiResponse<OpenTradeResponse>> {
    return this.request<OpenTradeResponse>('POST', '/trader/trade', { body: { type, amount }, auth: true });
  }

  async closeTrade(tradeId: number): Promise<ApiResponse<CloseTradeResponse>> {
    return this.request<CloseTradeResponse>('POST', '/trader/close', { body: { trade_id: tradeId }, auth: true });
  }

  async closeAllTrades(type: CloseType): Promise<ApiResponse<CloseAllTradesResponse>> {
    return this.request<CloseAllTradesResponse>('POST', '/trader/close-all', { body: { type }, auth: true });
  }

  async changeLeverage(leverage: number): Promise<ApiResponse<LeverageResponse>> {
    return this.request<LeverageResponse>('POST', '/trader/leverage', { body: { leverage }, auth: true });
  }

  // --- TP/SL Methods ---

  async updateTPSL(tradeId: number, tp?: number, sl?: number): Promise<ApiResponse<TpslResponse>> {
    return this.request<TpslResponse>('POST', '/trader/tpsl', { body: { trade_id: tradeId, tp: tp ?? 0, sl: sl ?? 0 }, auth: true });
  }

  async getPendingOrders(status?: PendingStatus | PendingStatus[]): Promise<ApiResponse<PendingOrdersResponse>> {
    const statusQuery = status
      ? `?status=${Array.isArray(status) ? status.join(',') : status}`
      : '';
    return this.request<PendingOrdersResponse>('GET', `/trader/pending${statusQuery}`, { auth: true });
  }

  async cancelPendingOrder(pendingId: number): Promise<ApiResponse<CancelPendingResponse>> {
    return this.request<CancelPendingResponse>('POST', '/trader/pending/cancel', { body: { pending_id: pendingId }, auth: true });
  }

  // --- History Methods ---

  async getHistory(filters?: HistoryFilters): Promise<ApiResponse<TradeHistoryResponse>> {
    const params = new URLSearchParams();
    if (filters?.page !== undefined) params.set('page', String(filters.page));
    if (filters?.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters?.type) params.set('type', filters.type);
    if (filters?.from_date) params.set('from_date', String(filters.from_date));
    if (filters?.to_date) params.set('to_date', String(filters.to_date));
    const query = params.toString();
    return this.request<TradeHistoryResponse>('GET', `/trader/history${query ? `?${query}` : ''}`, { auth: true });
  }

  // --- Accounting Methods ---

  async getMargin(): Promise<ApiResponse<MarginResponse>> {
    return this.request<MarginResponse>('GET', '/accounting/margin', { auth: true });
  }

  async getTransactions(page = 1, limit = 20): Promise<ApiResponse<TransactionsResponse>> {
    return this.request<TransactionsResponse>('GET', `/accounting/transactions?page=${page}&limit=${limit}`, { auth: true });
  }

  async getDepositConstraints(): Promise<ApiResponse<DepositConstraintsResponse>> {
    return this.request<DepositConstraintsResponse>('GET', '/accounting/deposit/constraints', { auth: true });
  }

  async getWithdrawConstraints(cardNumber?: string): Promise<ApiResponse<WithdrawConstraintsResponse>> {
    const query = cardNumber ? `?card_number=${encodeURIComponent(cardNumber)}` : '';
    return this.request<WithdrawConstraintsResponse>('GET', `/accounting/withdraw/constraints${query}`, { auth: true });
  }

  async depositIRT(amount: number, gateway: GatewayType = 'zibal'): Promise<ApiResponse<DepositResponse>> {
    return this.request<DepositResponse>('POST', '/accounting/deposit/irt', { body: { amount, gateway }, auth: true });
  }

  async depositUSDT(amount: number, txId: string): Promise<ApiResponse<DepositResponse>> {
    return this.request<DepositResponse>('POST', '/accounting/deposit/usdt', { body: { amount, tx_id: txId }, auth: true });
  }

  async withdraw(amount: number, type: WithdrawType, cardNumber?: string): Promise<ApiResponse<WithdrawResponse>> {
    const body: Record<string, unknown> = { amount, type };
    if (cardNumber) body.card_number = cardNumber;
    return this.request<WithdrawResponse>('POST', '/accounting/withdraw', { body, auth: true });
  }

  // --- KYC Methods ---

  async getKycStatus(): Promise<ApiResponse<KycStatusResponse>> {
    return this.request<KycStatusResponse>('GET', '/kyc/status', { auth: true });
  }

  async submitKycStep1(data: KycStep1Data): Promise<ApiResponse<KycResponse>> {
    return this.requestFormData<KycResponse>('POST', '/kyc/step1', data, { auth: true });
  }

  async submitKycStep2(data: KycStep2Data): Promise<ApiResponse<KycResponse>> {
    return this.requestFormData<KycResponse>('POST', '/kyc/step2', data, { auth: true });
  }

  async submitKycStep3(data: KycStep3Data): Promise<ApiResponse<KycResponse>> {
    return this.requestFormData<KycResponse>('POST', '/kyc/step3', data, { auth: true });
  }

  // --- Card Methods ---

  async listCards(): Promise<ApiResponse<CardListResponse>> {
    return this.request<CardListResponse>('GET', '/card/list', { auth: true });
  }

  async addCard(data: AddCardData): Promise<ApiResponse<AddCardResponse>> {
    return this.request<AddCardResponse>('POST', '/card/add', { body: data, auth: true });
  }

  async deleteCard(cardId: number): Promise<ApiResponse<DeleteCardResponse>> {
    return this.request<DeleteCardResponse>('POST', '/card/delete', { body: { card_id: cardId }, auth: true });
  }

  // --- Internal Request Methods ---

  private async request<T>(
    method: string,
    path: string,
    options: { body?: object; auth?: boolean } = {},
  ): Promise<ApiResponse<T>> {
    const { body, auth } = options;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.maxRetries) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (auth && this.token) {
          headers['x-token'] = this.token;
        }

        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json() as ApiResponse<T>;

        if (!response.ok) {
          const errorCode = typeof data.message === 'string' ? data.message : undefined;

          if (RETRYABLE_CODES.includes(errorCode ?? '') && attempt < this.maxRetries) {
            const delay = this.retryDelayMs * Math.pow(2, attempt);
            await this.sleep(delay);
            attempt++;
            lastError = new Error(`Retryable error: ${errorCode}`);
            continue;
          }

          throw new ApiError(
            data.message ?? response.statusText,
            response.status,
            response.statusText,
            errorCode,
            data,
          );
        }

        return data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }

        if (error instanceof TypeError && attempt < this.maxRetries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          await this.sleep(delay);
          attempt++;
          lastError = error;
          continue;
        }

        throw error;
      }
    }

    throw lastError ?? new ApiError('Request failed after retries', 0, 'Unknown');
  }

  private async requestFormData<T>(
    method: string,
    path: string,
    data: Record<string, string | File>,
    options: { auth?: boolean } = {},
  ): Promise<ApiResponse<T>> {
    const { auth } = options;
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value);
    }

    const headers: Record<string, string> = {};
    if (auth && this.token) {
      headers['x-token'] = this.token;
    }

    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    const responseData = await response.json() as ApiResponse<T>;

    if (!response.ok) {
      const errorCode = typeof responseData.message === 'string' ? responseData.message : undefined;
      throw new ApiError(
        responseData.message ?? response.statusText,
        response.status,
        response.statusText,
        errorCode,
        responseData,
      );
    }

    return responseData;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
