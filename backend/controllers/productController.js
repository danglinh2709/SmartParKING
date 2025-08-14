const {
  getOrders,
  getSingleOrder,
  createOrder,
} = require("../services/orderService");
const productService = require("../services/productService");

exports.create_order = async (req, res, next) => {
  const { userId, cart } = req.body;
  createOrder({ userId, cart })
    .then((result) => {
      res.status(result.statusCode).send({ ...result });
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_single_order = async (req, res, next) => {
  const { orderId, userId } = req.query;
  getSingleOrder({ orderId, userId })
    .then((result) => {
      const { message, data } = result;
      res.status(200).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_products = async (req, res, next) => {
  const { userId } = req.query;
  getOrders({ userId })
    .then((result) => {
      const { message, data } = result;
      res.status(200).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_all_products = async (req, res, next) => {
  productService.getAllProducts()
    .then((result) => {
      const { message, data } = result;
      res.status(200).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.get_product_by_id = async (req, res, next) => {
  const { id } = req.params;
  productService.getProductById(id)
    .then((result) => {
      const { message, data } = result;
      res.status(200).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

exports.create_product = async (req, res, next) => {
  const product = req.body;
  productService.createProduct(product)
      .then(result => {
          res.status(result.statusCode).json(result);
      })
      .catch(error => {
          res.status(500).json(error);
      });
}

exports.update_product = async (req, res, next) => {
  const { id } = req.params;
  const product = req.body;
  productService.updateProduct(id, product)
      .then(result => {
          res.status(result.statusCode).json(result);
      })
      .catch(error => {
          res.status(500).json(error);
      });
}

exports.delete_product = async (req, res, next) => {
  const { id } = req.params;
  productService.deleteProduct(id)
      .then(result => {
          res.status(result.statusCode).json(result);
      })
      .catch(error => {
          res.status(500).json(error);
      });
}