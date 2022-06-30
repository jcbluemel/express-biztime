/** Routes about company. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** GET / - returns `{companies: [{code, name}, ...]}` */

router.get("/", async function (req, res, next) {
    const results = await db.query("SELECT code, name FROM companies");
    const companies = results.rows;
  
    return res.json({ companies: companies });
  });


/** GET / - returns `{company: {code, name, description}}` */

router.get("/:code", async function (req, res, next) {
    const code = req.params.code
    const result = await db.query(
        `SELECT code, name, description
        FROM companies 
        WHERE code = $1`, [code]);
    
    const company = result.rows[0];
    return res.json({ company : company });
});


module.exports = router;