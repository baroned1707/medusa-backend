import { PaymentSessionStatus } from "@medusajs/medusa";
import { PaymentService } from "medusa-interfaces";
import axios from "axios";
import CryptoJS from "crypto-js";
import moment from "moment";

const config = {
  app_id: 2553,
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

class ZaloService extends PaymentService {
  static identifier = "zalo";
  static is_installed = true;
  cartService;

  constructor({ cartService }, options) {
    super();
    //you can access options here
    this.cartService = cartService;
  }

  //Run when create payment session
  async createPayment(cart) {
    const res = await this.requestPayment(cart);

    return {
      id: "zalo",
      status: "pending",
      order_url: res.order_url,
      app_trans_id: res.app_trans_id,
    };
  }

  async requestPayment(cart) {
    const embed_data = {
      redirecturl: `${process.env.FRONTEND_HOST}/checkout`,
    };
    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: "user123",
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: cart.total,
      description: `Lazada - Payment for the order #${transID}`,
      bank_code: "zalopayapp",
      callback_url: process.env.BACKEND_HOST + "/hook/zalo-callback",
    };

    console.log("Create Payment Request Zalo", order);

    const data =
      config.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;

    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const res = await axios.post(config.endpoint, order, {
      "Content-Type": "application/json",
    });

    console.log("Payment Request Zalo", res);

    await this.cartService
      .setMetadata(cart.id, "app_trans_id", order.app_trans_id)
      .then((res) => {
        console.log(res);
      });

    return { order_url: res.data.order_url, app_trans_id: order.app_trans_id };
  }

  async authorizePayment(paymentSession, context) {
    console.log("Authorize Payment", paymentSession);

    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data: {
        id: paymentSession.id,
      },
    };
  }

  async getPaymentData(paymentSession) {
    return paymentSession.data;
  }

  async getStatus(data) {
    return PaymentSessionStatus.AUTHORIZED;
  }

  async updatePaymentData(paymentSessionData, updatedData) {
    console.log("Update payment Data", paymentSessionData);

    return updatedData;
  }

  async updatePayment(paymentSessionData, cart) {
    const res = await this.requestPayment(cart);

    paymentSessionData.order_url = res.order_url;
    paymentSessionData.app_trans_id = res.app_trans_id;

    return paymentSessionData;
  }
}

export default ZaloService;
