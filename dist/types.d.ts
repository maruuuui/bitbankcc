export interface BrokerAdapter {
    broker: Broker;
    send(order: Order): Promise<void>;
    refresh(order: Order): Promise<void>;
    cancel(order: Order): Promise<void>;
    getBtcPosition(): Promise<number>;
    getPositions?: () => Promise<Map<string, number>>;
    fetchQuotes(): Promise<Quote[]>;
}
export interface BrokerConfigType {
    broker: string;
    npmPath?: string;
    enabled: boolean;
    key: string;
    secret: string;
    maxLongPosition: number;
    maxShortPosition: number;
    cashMarginType: CashMarginType;
    leverageLevel?: number;
    commissionPercent?: number;
}
export interface Quote {
    broker: Broker;
    side: QuoteSide;
    price: number;
    volume: number;
}
export interface Execution {
    broker: Broker;
    brokerOrderId: string;
    cashMarginType: CashMarginType;
    size: number;
    price: number;
    execTime: Date;
    side: OrderSide;
    symbol: string;
}
export interface Order {
    broker: Broker;
    side: OrderSide;
    size: number;
    price: number;
    cashMarginType: CashMarginType;
    type: OrderType;
    leverageLevel?: number;
    id: string;
    symbol: string;
    timeInForce: TimeInForce;
    brokerOrderId: string;
    status: OrderStatus;
    filledSize: number;
    creationTime: Date;
    sentTime: Date;
    lastUpdated: Date;
    executions: Execution[];
}
export declare enum OrderSide {
    Buy = "Buy",
    Sell = "Sell"
}
export declare enum TimeInForce {
    None = "None",
    Day = "Day",
    Gtc = "Gtc",
    Ioc = "Ioc",
    Fok = "Fok",
    Gtd = "Gtd"
}
export declare enum CashMarginType {
    Cash = "Cash",
    MarginOpen = "MarginOpen",
    NetOut = "NetOut"
}
export declare enum QuoteSide {
    Ask = "Ask",
    Bid = "Bid"
}
export declare enum OrderType {
    Market = "Market",
    Limit = "Limit",
    Stop = "Stop",
    StopLimit = "StopLimit"
}
export declare enum OrderStatus {
    New = "New",
    PartiallyFilled = "PartiallyFilled",
    Filled = "Filled",
    Canceled = "Canceled",
    PendingCancel = "PendingCancel",
    PendingAmend = "PendingAmend",
    PendingNew = "PendingNew",
    Rejected = "Rejected",
    Expired = "Expired"
}
export declare type Broker = string;
