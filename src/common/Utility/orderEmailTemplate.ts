import { Types } from "mongoose"

export const orderEmailTemplate = (
    orderName: string,
    orderId: Types.ObjectId,
    finalPrice: number) => {
    return `<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Order Confirmation</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f7ede3; font-family:Arial, sans-serif; color:#4e4241;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f7ede3; padding:30px 0;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td align="center" style="background-color:#efc2ab; padding:25px;">
                <h1 style="margin:0; color:#4e4241; font-size:24px;">Order Successfully Created 🎉</h1>
              </td>
            </tr>
            
            <!-- Body -->
            <tr>
              <td style="padding:30px;">
                <p style="font-size:16px; margin-bottom:20px;">Hi <strong>{{customerName}}</strong>,</p>
                <p style="font-size:16px; margin-bottom:20px;">
                  We’re excited to let you know that your order <strong>#{{orderId}}</strong> has been successfully created!
                </p>
                
                <table width="100%" cellpadding="8" cellspacing="0" style="margin:20px 0; border:1px solid #efc2ab; border-radius:8px;">
                  <tr style="background-color:#f7ede3;">
                    <th align="left" style="font-size:14px;">Item</th>
                    <th align="center" style="font-size:14px;">Qty</th>
                    <th align="right" style="font-size:14px;">Price</th>
                  </tr>
                  {{#each orderItems}}
                  <tr>
                    <td>{{this.name}}</td>
                    <td align="center">{{this.quantity}}</td>
                    <td align="right">{{this.price}}</td>
                  </tr>
                  {{/each}}
                </table>
                
                <p style="font-size:16px; text-align:right; margin-top:10px;">
                  <strong>Total: ${finalPrice}</strong>
                </p>

                <p style="font-size:15px; margin-top:30px;">
                  You’ll receive another email once your order has been placed.  
                  Thank you for shopping with us!
                </p>

                <div style="text-align:center; margin-top:30px;">
                  <a href="{{orderLink}}" style="background-color:#4e4241; color:#f7ede3; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:bold; display:inline-block;">
                    View Your Order
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="background-color:#efc2ab; padding:15px; font-size:13px; color:#4e4241;">
                © 2025 Your Company Name — All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}