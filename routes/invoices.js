const express = require("express");
const router = express.Router();
const db = require("../db");
const expressError = require("../expressError");

router.get("/", async (req, res) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        return res.json({ invoices: results.rows });
    } catch (e) {
        return next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(
            `SELECT * FROM invoices INNER JOIN companies on (invoices.comp_code = companies.code) where id=$1`,
            [id]
        );
        if (results.rows.length === 0) {
            throw new expressError(`Can't find invoices with id: ${id}`, 404);
        }
        return res.json({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.post("/", async (req, res, next) => {
    const { comp_code, amt } = req.body;
    try {
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );
        return res.status(201).json({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.patch("/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const { amt } = req.body;
        const results = await db.query(
            `UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`,
            [amt, id]
        );
        if (results.rows.length === 0) {
            throw new expressError(`Can't updated invalid invoice: ${id}`, 404);
        }
        return res.json({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const results = await db.query(`DELETE FROM invoices where id=$1`, [
            id,
        ]);
        if (results.rows.length === 0) {
            throw new expressError(`Invoice id: ${id} does not exist`, 404);
        }
        res.send({ message: "Deleted" });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
