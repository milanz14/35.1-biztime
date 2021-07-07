process.env.NODE_ENV = "test";
const request = require("supertest");
const { app } = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async () => {
    // create a company and a transaction and insert into the DB, set the test variables to the inserted
    let companyRes = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('testComp','Test Company','A Company for testing code') RETURNING *`
    );
    testCompany = companyRes.rows[0];
});

afterEach(async () => {
    // delete from the test DB
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    // close the connection
    await db.end();
});

describe("companies /GET works", () => {
    test("it should get the companies in the DB (one company)", async () => {
        const resp = await request(app).get("/companies");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({ companies: [testCompany] });
    });
});

describe("companies /POST works", () => {
    test("it should create a new company and add it to the DB", async () => {
        const resp = await request(app).post("/companies").send({
            code: "testCode",
            name: "test Company",
            description: "this is a test bio to validate POST route",
        });
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({
            company: {
                code: "testCode",
                name: "test Company",
                description: "this is a test bio to validate POST route",
            },
        });
    });
});

describe("PATCH /companies/:code", () => {
    test("it should update a company", async () => {
        const resp = await request(app)
            .patch(`/companies/${testCompany.code}`)
            .send({
                name: "updatedName",
                description: "updated description",
            });
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            company: {
                code: "testComp",
                name: "updatedName",
                description: "updated description",
            },
        });
    });
    test("it returns 404 for invalid company id", async () => {
        const resp = await request(app).patch("/companies/asdfesrw").send({
            name: "updatedName",
            description: "updated",
        });
        expect(resp.statusCode).toBe(404);
    });
});

describe("delete a created company", () => {
    test("it should delete a specified created company", async () => {
        const resp = await request(app).delete(
            `/companies/${testCompany.code}`
        );
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({
            message: "Deleted",
        });
    });
});
