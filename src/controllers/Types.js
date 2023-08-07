require('dotenv').config();
const axios = require("axios");
const {URL_API_TYPE} = process.env;
const { Type } = require("../db");

const getTypes = async (req, res) => {
  try {
    let pokeTypes = await Type.findAll({ attributes: [`name`] });
    if (!pokeTypes.length) {
      const { data } = await axios.get(`${URL_API_TYPE}`);

      const pokeType = data.results.map((result) => ({
        name: result.name,
      }));
      await Type.bulkCreate(pokeType)
      return res.status(200).json(pokeType);
    }
    return res.status(200).json(pokeTypes);
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

module.exports = {
  getTypes,
};
