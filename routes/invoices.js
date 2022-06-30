/** Routes about invoices. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");


/** GET / - list of all invoices
 *  returns `{invoices: [{id, comp_code}, ...]}` */
router.get("/", async function (req, res, next) {
    const results = await db.query(
        `SELECT id, comp_code 
            FROM invoices`);
    const invoices = results.rows;

    return res.json({ invoices });
});





module.exports = router;