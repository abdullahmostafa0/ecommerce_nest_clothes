import { Injectable } from "@nestjs/common";
import { OrderRepository } from "src/DB/models/Order/order.repository";
import { SalesOverTimeDto } from "./dto/time-range.dto";

@Injectable()
export class AnalyticsService {
    constructor(private readonly orderRepository: OrderRepository) { }

    async salesOverTime(dto: SalesOverTimeDto) {
        const { startDate, endDate, interval } = dto;
        const groupFormat = this.getDateGroupFormat(interval);
        const pipeline = [
            { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: groupFormat, date: "$createdAt" }
                    },
                    totalSales: { $sum: "$finalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ];
        const result = await this.orderRepository.aggregate(pipeline as any);
        return result.map(r => ({ period: r._id, value: r.totalSales }));
    }

    async ordersCountOverTime(dto: SalesOverTimeDto) {
        const { startDate, endDate, interval } = dto;
        const groupFormat = this.getDateGroupFormat(interval);
        const pipeline = [
            { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: groupFormat, date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];
        const result = await this.orderRepository.aggregate(pipeline as any);
        return result.map(r => ({ period: r._id, value: r.count }));
    }

    private getDateGroupFormat(interval: SalesOverTimeDto["interval"]) {
        switch (interval) {
            case "day": return "%Y-%m-%d";
            case "week": return "%G-%V"; // ISO week year-week
            case "month": return "%Y-%m";
            default: return "%Y-%m-%d";
        }
    }
}


