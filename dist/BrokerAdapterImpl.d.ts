import { BrokerAdapter, Order, Quote, BrokerConfigType } from './types';
export default class BrokerAdapterImpl implements BrokerAdapter {
    private readonly config;
    private readonly log;
    private readonly brokerApi;
    readonly broker = "Bitbankcc";
    constructor(config: BrokerConfigType);
    send(order: Order): Promise<void>;
    refresh(order: Order): Promise<void>;
    cancel(order: Order): Promise<void>;
    getBtcPosition(): Promise<number>;
    getPositions(): Promise<Map<string, number>>;
    fetchQuotes(): Promise<Quote[]>;
    private mapSymbolToPair;
    private mapOrderToSendOrderRequest;
    private mapToQuote;
}
