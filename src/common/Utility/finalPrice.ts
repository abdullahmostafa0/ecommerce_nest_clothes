import { discountTypeEnum } from "src/DB/models/Product/product.model";

export function calculateFinalPrice(price:number, discount:number, discountType:discountTypeEnum) {
    return discountType === discountTypeEnum.PERCENTAGE ? 
    price - (price * discount) / 100 :
    price - discount
}