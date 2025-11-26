const pool = require("../database/")

/* ***************************
 *  Get all classification data
 ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items by classification_id
 ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
             JOIN public.classification AS c 
             ON i.classification_id = c.classification_id 
             WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getInventoryByClassificationId error " + error)
    }
}

/* ***************************
 *  Get a single inventory item by inv_id
 ************************** */
async function getInventoryByInvId(invId) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
             JOIN public.classification AS c
             ON i.classification_id = c.classification_id
             WHERE i.inv_id = $1`,
            [invId]
        )
        return data.rows[0] // return single vehicle
    } catch (error) {
        console.error("getInventoryByInvId error " + error)
    }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
) {
    try {
        const sql =
            `UPDATE public.inventory
       SET inv_make = $1,
           inv_model = $2,
           inv_description = $3,
           inv_image = $4,
           inv_thumbnail = $5,
           inv_price = $6,
           inv_year = $7,
           inv_miles = $8,
           inv_color = $9,
           classification_id = $10
       WHERE inv_id = $11
       RETURNING *`;

        const data = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
            inv_id
        ]);

        return data.rows[0];
    } catch (error) {
        console.error("model error: " + error);
    }
}

/* ***************************
 *  Add a new inventory item
 ************************** */
async function addInventory(
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
) {
    try {
        const sql = `INSERT INTO public.inventory
            (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`;

        const data = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id
        ]);

        return data.rows[0]; // returns the newly inserted row
    } catch (error) {
        console.error("addInventory error: " + error);
    }
}

/* ****************************************
 * Delete Inventory Item
 **************************************** */
async function deleteInventoryItem(inv_id) {
    try {
        const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
        const data = await pool.query(sql, [inv_id])
        return data.rowCount // 1 if deleted, 0 if not
    } catch (error) {
        console.error("Delete Inventory Error: " + error)
        return 0
    }
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryByInvId,
    updateInventory,
    addInventory,
    deleteInventoryItem
}