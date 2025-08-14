const db = require("../database/db");
const countryHelper = require("../helpers/countryHelper");
const stateHelper = require("../helpers/stateHelper");

exports.getAddressesByUserId = async (params) => {
    const {plate_number} = params;

    if (!plate_number) throw { message: "plate_number was not provided", statusCode: 400 };

    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ActivityLogs where plate_number = ${plate_number}`, (err, results) => {
            if (err) reject({ message: err, statusCode: 500 })
            else {
                resolve({
                    statusCode: 200, data: results, total: results.length
                });
            }
        });
    });
};

// exports.getAllAddresses = () => {
//   return new Promise((resolve, reject) => {
//     db.query(`SELECT * FROM addresses`, (err, result) => {
//       if (err) {
//         console.log(err);
//         reject({ error: "Internal Server Error" });
//       } else {
//         resolve({ data: result, total: result.length });
//       }
//     });
//   });
// }

exports.getAddressById = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM addresses WHERE id = ${id}`, (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: "Internal Server Error" });
            } else {
                resolve(result[0]);
            }
        });
    });
}

exports.createAddress = (addressData) => {
    const filesQuery = `INSERT INTO Files (file_path) VALUES ?`;
    const values = [[addressData.front_image]]
    return new Promise((resolve, reject) => {
        db.query(filesQuery,
            [values],
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject({ error: "Internal Server Error", msg: err.sqlMessage });
                } else {
                    const sqlQuery = `INSERT INTO ActivityLogs SET plate_number = ?,
                        time_in = ?,
                        front_image_id = ?,
                        back_image_id = ?`;
                    db.query(sqlQuery,
                        [addressData.plate_number,
                        new Date().toISOString().slice(0, 19).replace('T', ' '),
                        result.insertId,
                        result.insertId
                        ],
                        (err, result1) => {
                            if (err) {
                                console.log(err);
                                reject({ error: "Internal Server Error", msg: err.sqlMessage });
                            } else {
                                resolve({ data: result1, statusCode: 200 });
                            }
                        });
                }
            });
    });
}

exports.updateAddress = (id, addressData) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `UPDATE addresses SET line1 = ?, line2 = ?, city = ?, street_name = ?, country = ?, phone = ?, pincode = ?, user_id = ?, title = ?, street = ?, country_id = ?, is_default = ?, type = ?, state_id = ? WHERE id = ?`;

        db.query(sqlQuery,
            [addressData.line1, addressData.line2, addressData.city, addressData.street_name, addressData.country, addressData.phone, addressData.pincode, addressData.user_id, addressData.title, addressData.street, addressData.country_id, addressData.is_default, addressData.type, addressData.state_id, id],
            (err, result) => {
                if (err) {
                    console.log(err);
                    reject({ message: err, statusCode: 500 });
                } else {
                    resolve({ message: "Address updated successfully", data: result, statusCode: 200 });
                }
            });
    });
}

exports.deleteAddress = (id) => {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM addresses WHERE id = ?`, [id], (err, result) => {
            if (err) {
                console.log(err);
                reject({ error: err });
            } else {
                resolve({ data: result });
            }
        });
    });
}