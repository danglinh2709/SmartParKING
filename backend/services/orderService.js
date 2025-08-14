const db = require("../database/db");

exports.createOrder = async (params) => {
    const {userId, cart} = params;

    if (!cart) throw {message: "cart was not provided", statusCode: 400};
    if (!userId) throw {message: "userId was not provided", statusCode: 400};

    return new Promise((resolve, reject) => {
        db.query(`INSERT INTO orders (user_id) VALUES (?)`, [userId], (err, result) => {
            if (err) reject({message: err, statusCode: 500});

            if (result) {
                let newOrderId = result.insertId;
                cart.products.forEach(async (prod) => {
                    db.query(`SELECT p.quantity FROM products p WHERE p.id = ?`, [prod.id], (err, result) => {
                        if (err) reject({message: err, statusCode: 500});

                        let productQuantity = result[0].quantity; // db product

                        // deduct the quantity from products that were ordered in db
                        let updatedQuantity = productQuantity - prod.quantity;
                        if (updatedQuantity > 0) {
                            productQuantity = updatedQuantity;
                        } else productQuantity = 0;

                        db.query(`INSERT INTO orders_details (order_id, product_id, quantity) VALUES (?,?,?)`, [newOrderId, prod.id, prod.quantity], (err, result) => {
                            if (err) reject({message: err, statusCode: 500});

                            db.query(`UPDATE products SET quantity = ${productQuantity} WHERE id = ${prod.id}`, (err, result) => {
                                if (err) reject({message: err, statusCode: 500});
                                console.log(result);
                            });
                        });
                    });
                });

                resolve({
                    message: `Order was successfully placed with order id ${newOrderId}`,
                    orderId: newOrderId,
                    products: cart.products,
                    statusCode: 201,
                });
            } else {
                reject({
                    message: "New order failed while adding order details", statusCode: 500,
                });
            }
        });
    });
};

exports.getSingleOrder = async (params) => {
    const {orderId, userId} = params;

    if (!orderId) throw {message: "orderId was not provided", statusCode: 400};
    if (!userId) throw {message: "userId was not provided", statusCode: 400};

    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM orders INNER JOIN orders_details ON ( orders.id = orders_details.order_id ) WHERE orders.id = ? AND orders.user_id = ?`, [orderId, userId], (err, result) => {
            if (err) reject({message: err, statusCode: 500});

            if (result.length === 0) reject({message: "order was not found", statusCode: 400});

            resolve({
                statusCode: 200, message: `Order was found`, data: result,
            });
        });
    });
};

exports.getOrders = async (params) => {
    const {userId} = params;

    if (!userId) throw {message: "userId was not provided", statusCode: 400};

    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM orders INNER JOIN orders_details ON ( orders.id = orders_details.order_id ) WHERE user_id = ?`, [userId], (err, result) => {
            if (err) reject({message: err, statusCode: 500});

            if (result.length === 0) reject({message: "No order were found", statusCode: 400});

            resolve({
                statusCode: 200, message: `${result.length} orders were found`, data: result,
            });
        });
    });
};

exports.getAllOrders = () => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM orders`, (err, result) => {
            if (err) {
                console.log(err);
                reject({error: "Internal Server Error"});
            } else {
                resolve({data: result, total: result.length});
            }
        });
    });
}

exports.updateOrder = (id, orderData) => {

    // if (!orderId) throw {message: "orderId was not provided", statusCode: 400};
    return new Promise((resolve, reject) => {
        const sqlQuery = `UPDATE orders SET order_number = ?, 
            amount = ?, 
            consumer_id = ?, 
            products = ?,
             coupon_id = ?,
             billing_address_id = ?,
             shipping_address_id = ?,
             order_status_id = ?,
             payment_method = ?,
             payment_status = ?,
             sub_orders = ?,
            tax_total = ?,
            total = ?,
            delivery_description = ?,
            parent_id = ?,
            status = ?,
            invoice_url = ?,
            created_by_id = ?,
            updated_at = NOW()
             WHERE id = ?`
        db.query(sqlQuery, [orderData.order_number, orderData.amount, orderData.consumer_id, orderData.products, orderData.coupon_id, orderData.billing_address_id, orderData.shipping_address_id, orderData.order_status_id, orderData.payment_method, orderData.payment_status, orderData.sub_orders, orderData.tax_total, orderData.total, orderData.delivery_description, orderData.parent_id, orderData.status, orderData.invoice_url, orderData.created_by_id, id], (err, result) => {
            if (err) {
                console.error(err);
                reject({message: err, statusCode: 500});
            } else {
                resolve({message: "Order updated successfully", data: result, statusCode: 200});
            }
        });
    });
};

exports.deleteOrder = (orderId) => {
    return new Promise((resolve, reject) => {
        db.query(`UPDATE orders SET status = 0, deleted_at = NOW() WHERE id = ?`, [orderId], (err, result) => {
            if (err) {
                console.error(err);
                reject({message: err, statusCode: 500});
            } else {
                resolve({message: "Order deleted successfully", data: result, statusCode: 200});
            }
        });
    });
}