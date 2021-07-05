const express = require("express");
const app = express();
const port = 3000;
const expressError = require("./expressError");
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");

app.use(express.json());
app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);

app.use((req, res, next) => {
    const err = new expressError("Not Found", 404);
    return next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 404);
    return res.json({
        error: err.message,
        status: err.status,
    });
});

module.exports = { app, port };
