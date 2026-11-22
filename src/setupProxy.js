const express = require("express");
const { archiveDirectory } = require("../scripts/build-archive.cjs");

module.exports = (app) => {
  app.use("/archive", express.static(archiveDirectory));
  // Keep missing archive files out of the SPA fallback so they don't return the new site.
  app.use("/archive", (_request, response) => response.sendStatus(404));
};
