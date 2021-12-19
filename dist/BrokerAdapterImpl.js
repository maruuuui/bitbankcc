"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const _ = require("lodash");
const bitbankcc_api_1 = require("@bitr/bitbankcc-api");
const logger_1 = require("@bitr/logger");
const util_1 = require("./util");
class BrokerAdapterImpl {
    constructor(config) {
        this.config = config;
        this.log = logger_1.getLogger('Bitbankcc.BrokerAdapter');
        this.broker = 'Bitbankcc';
        this.brokerApi = new bitbankcc_api_1.default(this.config.key, this.config.secret);
        this.brokerApi.on('private_request', req => this.log.debug(`Sending HTTP request... URL: ${req.url} Request: ${JSON.stringify(req)}`));
        this.brokerApi.on('private_response', (response, request) => this.log.debug(`Response from ${request.url}. Content: ${JSON.stringify(response)}`));
    }
    send(order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (order.broker !== this.broker) {
                throw new Error();
            }
            const request = this.mapOrderToSendOrderRequest(order);
            const reply = yield this.brokerApi.sendOrder(request);
            order.brokerOrderId = String(reply.order_id);
            order.status = types_1.OrderStatus.New;
            order.sentTime = new Date();
            order.lastUpdated = new Date();
        });
    }
    refresh(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderId = order.brokerOrderId;
            const request = { pair: this.mapSymbolToPair(order.symbol), order_id: Number(orderId) };
            const response = yield this.brokerApi.getOrder(request);
            order.filledSize = util_1.eRound(response.executed_amount);
            switch (response.status) {
                case 'CANCELED_UNFILLED':
                    order.status = types_1.OrderStatus.Canceled;
                    break;
                case 'CANCELED_PARTIALLY_FILLED':
                    order.status = types_1.OrderStatus.Canceled;
                    break;
                case 'FULLY_FILLED':
                    order.status = types_1.OrderStatus.Filled;
                    break;
                case 'PARTIALLY_FILLED':
                    order.status = types_1.OrderStatus.PartiallyFilled;
                    break;
            }
            order.lastUpdated = new Date();
            order.executions = [
                {
                    broker: order.broker,
                    brokerOrderId: order.brokerOrderId,
                    cashMarginType: order.cashMarginType,
                    side: order.side,
                    symbol: order.symbol,
                    size: order.filledSize,
                    price: _.round(response.average_price),
                    execTime: new Date(0)
                }
            ];
        });
    }
    cancel(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const pair = this.mapSymbolToPair(order.symbol);
            yield this.brokerApi.cancelOrder({ pair, order_id: Number(order.brokerOrderId) });
            order.lastUpdated = new Date();
            order.status = types_1.OrderStatus.Canceled;
        });
    }
    getBtcPosition() {
        return __awaiter(this, void 0, void 0, function* () {
            const btc = (yield this.getPositions()).get('btc');
            if (btc === undefined) {
                throw new Error('Unable to find btc position.');
            }
            return btc;
        });
    }
    getPositions() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.brokerApi.getAssets();
            return new Map(response.assets.map(x => [x.asset.toUpperCase(), x.onhand_amount]));
        });
    }
    fetchQuotes() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.brokerApi.getDepth({ pair: 'btc_jpy' });
            return this.mapToQuote(response);
        });
    }
    mapSymbolToPair(symbol) {
        let pair = '';
        switch (symbol) {
            case 'BTC/JPY':
                pair = 'btc_jpy';
                break;
            default:
                throw new Error('Not implemented.');
        }
        return pair;
    }
    mapOrderToSendOrderRequest(order) {
        if (order.cashMarginType !== types_1.CashMarginType.Cash) {
            throw new Error('Not implemented.');
        }
        let pair = this.mapSymbolToPair(order.symbol);
        let price = 0;
        let type = '';
        switch (order.type) {
            case types_1.OrderType.Limit:
                type = 'limit';
                price = order.price;
                break;
            case types_1.OrderType.Market:
                type = 'market';
                price = 0;
                break;
            default:
                throw new Error('Not implemented.');
        }
        return {
            price,
            pair,
            type,
            side: types_1.OrderSide[order.side].toLowerCase(),
            amount: order.size,
            post_only: true,
        };
    }
    mapToQuote(depth) {
        const asks = _(depth.asks)
            .take(100)
            .map(q => {
            return { broker: this.broker, side: types_1.QuoteSide.Ask, price: Number(q[0]), volume: Number(q[1]) };
        })
            .value();
        const bids = _(depth.bids)
            .take(100)
            .map(q => {
            return { broker: this.broker, side: types_1.QuoteSide.Bid, price: Number(q[0]), volume: Number(q[1]) };
        })
            .value();
        return _.concat(asks, bids);
    }
} /* istanbul ignore next */
exports.default = BrokerAdapterImpl;
