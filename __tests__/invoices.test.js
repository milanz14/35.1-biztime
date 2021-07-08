// create both an invoice and a company and then join the tables in a query
process.env.NODE_ENV = "test";
const request = require("supertest");
const { app } = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;

beforeEach(async () => {
    let companyRes = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('testComp','Test Company','A Company for testing code') RETURNING *`
    );
    testCompany = companyRes.rows[0];
    let invoiceRes = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('testComp',${100},${false},'2020-06-07','2020-07-07') RETURNING id, comp_code`
    );
    testInvoice = invoiceRes.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
    await db.end();
});

describe("invoices /GET works", () => {
    test("it should return the invoice", async () => {
        const resp = await request(app).get("/invoices");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            invoices: [{ testInvoice }],
        });
    });
});
