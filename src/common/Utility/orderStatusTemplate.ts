import { Types } from "mongoose"
import { OrderStatus } from "src/User/Order/order.interface"

export const orderStatusTemplate = (
    orderName: string,
    orderId: Types.ObjectId,
    status: OrderStatus) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Status Update</title>
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
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #efc2ab;
      text-align: center;
      padding: 30px 20px;
    }
    .header h1 {
      margin: 0;
      color: #4e4241;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px 25px;
      line-height: 1.6;
      background-color: #f7ede3;
    }
    .content h2 {
      font-size: 20px;
      color: #4e4241;
      margin-bottom: 10px;
    }
    .content p {
      font-size: 16px;
      margin: 0 0 20px;
    }
    .order-summary {
      background-color: #ffffff;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #efc2ab;
      margin-bottom: 20px;
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
      padding: 20px;
      font-size: 13px;
      color: #4e4241;
      background-color: #efc2ab;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Order Status Update</h1>
    </div>
    <div class="content">
      <h2>Hello ${orderName},</h2>
      <p>
        We wanted to let you know that your order <strong>#${orderId}</strong> is now
        <strong>${status}</strong>.
      </p>


      <p>
        You can track your order or view more details by clicking the button below:
      </p>
      <p style="text-align: center;">
        <a href="[Tracking Link]" class="button">View Order</a>
      </p>
      <p>Thank you for shopping with us!</p>
    </div>
    <div class="footer">
      <p>&copy; 2018 extra chic All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}