import { IsDateString, IsIn } from "class-validator";

export class SalesOverTimeDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsIn(["day", "week", "month"])
    interval: "day" | "week" | "month";
}


