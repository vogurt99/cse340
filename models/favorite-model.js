const pool = require("../database")

async function addFavorite(account_id, inv_id) {
    try {
        const sql = `
      INSERT INTO favorite (account_id, inv_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *`
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rowCount > 0
    } catch (error) {
        return false
    }
}

async function getFavoriteByAccountId(account_id) {
    try {
        const sql = `
      SELECT i.*
      FROM favorite f
      JOIN inventory i ON f.inv_id = i.inv_id
      WHERE f.account_id = $1`
        const result = await pool.query(sql, [account_id])
        return result.rows
    } catch (error) {
        return []
    }
}

async function removeFavorite(account_id, inv_id) {
    try {
        const sql = `DELETE FROM favorite WHERE account_id = $1 AND inv_id = $2`
        const result = await pool.query(sql, [account_id, inv_id])
        return result.rowCount > 0
    } catch (error) {
        return false
    }
}

module.exports = {
    addFavorite,
    getFavoriteByAccountId,
    removeFavorite
}