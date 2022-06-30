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
            FROM invoices`
  );
  const invoices = results.rows;

  return res.json({ invoices });
});



/** GET / - Details about single invoices by id
 *  Returns 404 if invoice id not found.
 *  Else returns ` {invoice: {id, amt, paid, add_date, paid_date,
 *                  company: {code, name, description}}` */

router.get("/:id", async function (req, res, next) {
  const id = req.params.id;
  const iResult = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code AS company
            FROM invoices
            WHERE id = $1`,
    [id]
  );
  const invoice = iResult.rows[0];

  const cResult = await db.query(
    `SELECT code, name, description
            FROM companies
            WHERE code = $1`,
    [invoice.company]
  );
  const company = cResult.rows[0];

  invoice.company = company

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);

  return res.json({ invoice });
});


/** POST / - add a invoice, takes JSON: {comp_code, amt}
 *  returns `{invoice: {id, comp_code, amt, paid, add_date, paid_date}}` */

 router.post("/", async function (req, res, next) {
	const { comp_code, amt } = req.body;
	const result = await db.query(
	    `INSERT INTO invoices
		(comp_code, amt)
		VALUES ($1, $2)
		RETURNING id, comp_code, amt, paid, add_date, paid_date `,
	    [comp_code, amt]
	);
    
	const newInvoice = result.rows[0];
    
	return res.status(201).json({ invoice: newInvoice });
    });
    


/** PUT / - Edit an existing company, takes JSON: { name, description }
 *  Returns 404 if company code not found.
 *  Else returns `{ company: { code, name, description } }` */

 router.put("/:id", async function (req, res, next) {

	if ("id" in req.body) throw new BadRequestError("Not allowed");
    
	const { amt } = req.body;
	const id = req.params.id;
    
	const result = await db.query(
	    `UPDATE invoices
		SET amt = $1
		WHERE id = $2
		RETURNING id, comp_code, amt, paid, add_date, paid_date`,
	    [amt, id]
	);
    
	const editedInvoice = result.rows[0];
	if (!editedInvoice) throw new NotFoundError(`No matching invoice: ${id}`);
    
	return res.json({ invoice: editedInvoice });
    });
    


module.exports = router;
