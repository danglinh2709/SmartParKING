const userService = require("../services/userService");
const addressService = require("../services/addressService");
const roleHelper = require("../helpers/roleHelper");

exports.update_user = async (req, res, next) => {
  const { userId } = req.params;
  const { fullName, email, password } = req.body;

  userService.updateUser({ userId, fullName, email, password })
    .then((result) => {
      const { statusCode = 200, message, data } = result;
      res.status(statusCode).send({ message, data });
    })
    .catch((err) => {
      const { statusCode = 400, message, data } = err;
      res.status(statusCode).send({ message, data }) && next(err);
    });
};

exports.get_test_user_info = async (req, res, next) => {
  const { userId = 22 } = req.query;

  userService.getTestUserInfo({ userId })
    .then((result) => {
      let { data, total } = result;
      if (data) {
        addressService.getAddressesByUserId(data[0].id)
          .then((addressRes) => {
            data = data.map(i => {
              i.address = addressRes.data;
              i.role = roleHelper.getById(i.role_id);
              return i;
            });
            res.json(data[0]);
          })
          .catch((err) => {
            console.log(err.message)
          });
      }
      else {
        res.json(data);
      }
    })
    .catch((err) => {
      const { statusCode = 400, message } = err;
      res.status(statusCode).send({ message }) && next(err);
    });
};

