const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const testsFolder = path.join(__dirname, '../output');

router.get('/:resultSet/asd', (req, res, next) => {
  let pa = path.join(testsFolder, req.params.resultSet);

  fs.readFile(pa, 'utf8', (err, data) => {
    if (err) {
        throw err;
    } 
    let obj = JSON.parse(data);
    res.json(obj);
  });
});

router.get('/sets', (req, res, next) => {
    fs.readdir(testsFolder, (err, files) => {
        res.json(files);
    });
});

module.exports = router;