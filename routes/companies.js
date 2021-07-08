const express = require("express");
const router = express.Router();
const db = require("../db");
const expressError = require("../expressError");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }
});

router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            `SELECT code, name, description FROM companies WHERE code=$1`,
            [code]
        );
        const invoiceResults = await db.query(
            `SELECT id FROM invoices WHERE comp_code=$1`,
            [code]
        );
        if (results.rows.length === 0) {
            throw new expressError(`Can't find company with code ${code}`, 404);
        }
        const company = results.rows[0];
        const invoices = invoiceResults.rows;
        company.invoices = invoices.map((i) => i.id);
        return res.json({ company: company });
    } catch (e) {
        return next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const sluggedCode = slugify(name, {
            replacement: "-",
            lower: true,
        });
        const results = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
            [sluggedCode, name, description]
        );
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.patch("/:code", async (req, res, next) => {
    const { code } = req.params;
    try {
        const { name, description } = req.body;
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
            [name, description, code]
        );
        if (results.rows.length === 0) {
            throw new expressError(
                `Can't find company with code: ${code}`,
                404
            );
        }
        return res.json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete("/:code", async (req, res, next) => {
    const { code } = req.params;
    try {
        const results = db.query(
            `DELETE FROM companies WHERE code=$1 RETURNING *`,
            [code]
        );
        res.send({ message: "Deleted" });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
