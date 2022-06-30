/** Routes about company. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/** GET / - list of all companies
 *  returns `{ companies: [{ code, name }, ...]}` */

router.get("/", async function (req, res, next) {
    const results = await db.query("SELECT code, name FROM companies");
    const companies = results.rows;

    return res.json({ companies: companies });
});


/** GET / - details about single company by code
 *  returns `{ company: {code, name, description } }` */

router.get("/:code", async function (req, res, next) {
    const code = req.params.code;
    const result = await db.query(
        `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [code]);

    const company = result.rows[0];
    return res.json({ company: company });
});


/** POST / - add a company, takes JSON: { code, name, description }
 *  returns `{ company: { code, name, description } }` */

router.post("/", async function (req, res, next) {
    const { code, name, description } = req.body;
    const result = await db.query(
        `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
        [code, name, description]
    );

    const newCompany = result.rows[0];
    return res.status(201).json({ company: newCompany });
});


module.exports = router;