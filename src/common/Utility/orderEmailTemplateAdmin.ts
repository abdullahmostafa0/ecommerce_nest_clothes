import { Types } from "mongoose"
import { OrderStatus, PaymentWay } from "src/User/Order/order.interface"

export const orderEmailTemplateAdmin = (
    orderName: string,
    customerEmail: string,
    orderId: Types.ObjectId,
    finalPrice: number,
    paymentMethod: PaymentWay,
    status: OrderStatus,
    ) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Order Notification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7ede3;
      font-family: 'Arial', sans-serif;
      color: #4e4241;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #efc2ab;
      padding: 25px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #4e4241;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 25px;
      background-color: #f7ede3;
      line-height: 1.6;
    }
    .content h2 {
      margin-top: 0;
      font-size: 18px;
      color: #4e4241;
    }
    .order-details {
      background-color: #ffffff;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #efc2ab;
      margin-top: 10px;
      margin-bottom: 20px;
    }
    .order-details p {
      margin: 5px 0;
      font-size: 15px;
    }
    .button {
      display: inline-block;
      background-color: #4e4241;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      background-color: #efc2ab;
      color: #4e4241;
      padding: 15px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>New Order Created</h1>
    </div>
    <div class="content">
      <h2>Hello Admin,</h2>
      <p>A new order has been successfully created by a user. Below are the order details:</p>

      <div class="order-details">
        <p><strong>User Name:</strong> ${orderName}</p>
        <p><strong>User Email:</strong> ${customerEmail}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> ${finalPrice}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <p><strong>Status:</strong> ${status}</p>
      </div>

      <p>You can review the order and take further action from your admin dashboard.</p>
      
    </div>
    <div class="footer">
      <p>© 2018 Extra Chic. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}