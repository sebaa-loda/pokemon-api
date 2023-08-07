const router = require('express').Router();
const {getTypes} = require("../controllers/Types")

router.get("/",getTypes);

module.exports = router;