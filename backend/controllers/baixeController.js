const addressService = require("../services/baixeService");

// exports.create_address = async (req, res, next) => {
//   const { userId, cart } = req.body;
//   createOrder({ userId, cart })
//     .then((result) => {
//       res.status(result.statusCode).send({ ...result });
//     })
//     .catch((err) => {
//       const { statusCode = 400, message } = err;
//       res.status(statusCode).send({ message }) && next(err);
//     });
// };

exports.get_single_address_by_userId = async (req, res, next) => {
  const { plate_number } = req.query;
  
  addressService.getAddressesByUserId({ plate_number })
    .then((result) => {
      const {data, total} = result;
      res.json({ data, total });
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

// exports.get_orders = async (req, res, next) => {
//   const { userId } = req.query;
//   getOrders({ userId })
//     .then((result) => {
//       const { message, data } = result;
//       res.status(200).send({ message, data });
//     })
//     .catch((err) => {
//       const { statusCode = 400, message } = err;
//       res.status(statusCode).send({ message }) && next(err);
//     });
// };

// exports.get_all_addresses = async (req, res, next) => {
//   addressService.getAllAddresses()
//     .then((result) => {
//       const { data, total } = result;
//       res.json({ data, total });
//     })
//     .catch((err) => {
//       const { statusCode = 400, message } = err;
//       res.status(statusCode).send({ message }) && next(err);
//     });
// }

exports.get_address_by_id = async (req, res) => {
  const { id } = req.params;
  addressService.getAddressById( id )
    .then(result => {
      res.json({ data: result });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
}

exports.create_address = async (req, res) => {
  const addressData = req.body;
  addressService.createAddress(addressData)
    .then(result => {
        res.status(result.statusCode).json(result);
    })
    .catch(err => {
       res.status(500).json(err);

    });
}

exports.update_address = async (req, res) => {
  const {id} = req.params;
  const addressData = req.body;

  addressService.updateAddress(id, addressData)
      .then(result => {
          res.status(result.statusCode).json(result);
      })
      .catch(error => {
          res.status(error.statusCode || 500).json(error);
    });
}

exports.delete_address = async (req, res) => {
  const {id} = req.params;
  addressService.deleteAddress(id)
      .then(result => {
          res.json({ data: result });
      })
      .catch(error => {
          res.status(500).json(error);
    });
}