export default (router) => {
  router.post("/hook/zalo-callback", async (req, res) => {
    try {
      req.body = JSON.parse(req.body.data);
      console.log("Received Callback Zalopay", req.body);

      const cartService = req.scope.resolve("cartService");
      const orderService = req.scope.resolve("orderService");

      const [cart] = await cartService.list(
        {
          metadata: { app_trans_id: req.body.app_trans_id },
        },
        {
          relations: ["region", "payment_sessions"],
        }
      );

      console.log(req.body.app_trans_id, cart);

      await cartService.authorizePayment(cart.id, cart);

      const order = await orderService.createFromCart(cart.id);

      await orderService.capturePayment(order.id);

      res.status(200).json({
        success: true,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "BAD REQUEST",
      });
    }
  });

  return router;
};
