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


/** GET / - Details about single company by code
 *  Returns 404 if company code not found.
 *  Else returns `{ company: {code, name, description } }` */

router.get("/:code", async function (req, res, next) {
    const code = req.params.code;
    const result = await db.query(
        `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [code]);

    const company = result.rows[0];
    if (!company) throw new NotFoundError(`No matching company: ${code}`);

    return res.json({ company: company });
});


/** POST / - add a company, takes JSON: { code, name, description }
 *  returns `{ company: { code, name, description } }` */

router.post("/", async function (req, res, next) {
    const { code, name, description } = req.body;
    const result = await db.query(
        `INSERT INTO companies
            (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
        [code, name, description]
    );

    const newCompany = result.rows[0];

    return res.status(201).json({ company: newCompany });
});


/** PUT / - Edit an existing company, takes JSON: { name, description }
 *  Returns 404 if company code not found.
 *  Else returns `{ company: { code, name, description } }` */

router.put("/:code", async function (req, res, next) {

    if ("code" in req.body) throw new BadRequestError("Not allowed");

    const { name, description } = req.body;
    const code = req.params.code;

    const result = await db.query(
        `UPDATE companies
            SET name = $1,
                description = $2
            WHERE code = $3
            RETURNING code, name, description`,
        [name, description, code]
    );

    const editedCompany = result.rows[0];
    if (!editedCompany) throw new NotFoundError(`No matching company: ${code}`);

    return res.json({ company: editedCompany });
});



/** DELETE / - Delete a company
 *  Returns 404 if company code not found.
 *  Else returns `{ status: "deleted" }` */

router.delete("/:code", async function (req, res, next) {

    const code = req.params.code;

    const result = await db.query(
        `DELETE FROM companies
            WHERE code = $1
            RETURNING code`,
        [code]
    );

    const deletedCompanyCode = result.rows[0];
    if (!deletedCompanyCode) throw new NotFoundError(`No matching company: ${code}`);

    return res.json({ status: "deleted" });
});



module.exports = router;