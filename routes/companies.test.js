"use strict";
const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice1;
let testInvoice2;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");

  const results = await db.query(`
    INSERT INTO companies (code, name, description)
      VALUES ('test_code', 'test_company', 'test_description')
      RETURNING code, name`);
  testCompany = results.rows[0];

  const mResults = await db.query(`
    INSERT INTO invoices (comp_code, amt)
      VALUES ($1, 500),
            ($1, 800)
      RETURNING id`, [testCompany.code]);
  testInvoice1 = mResults.rows[0];
  testInvoice2 = mResults.rows[1];
});

/** GET /companies - returns `{ companies: [{ code, name }, ...]}` */
describe("GET /companies", function () {

  test("/", async function () {
    const resp = await request(app).get("/companies");
    // USE FOR TESTS IF YOU KNOW THE DETAILS
    expect(resp.body).toEqual({
      companies: [
        { code: "test_code", name: "test_company" },
      ],
    });
    // USE FOR TESTS IF YOU DON'T KNOW A DETAIL (random ID?)
    expect(resp.body).toEqual({
      companies: [
        { code: testCompany.code, name: testCompany.name },
      ],
    });
    // BAD. NOT ALWAYS IN CONTROL OF TESTCOMPANY
    expect(resp.body).toEqual({
      companies: [ testCompany ],
    });
  });
});

afterAll(async function () {
  await db.end();
});