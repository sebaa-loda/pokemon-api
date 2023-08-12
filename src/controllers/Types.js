require('dotenv').config();
const axios = require("axios");
const {URL_API_TYPE} = process.env;
const { Type } = require("../db");

const getTypes = async (req, res) => {
  try {
    let pokemonTypes = await Type.findAll({ attributes: [`id`,`name`] });
    if (!pokemonTypes.length) {
      const { data } = await axios.get(`${URL_API_TYPE}`);
      const allTypes = data.results
      const types = []
      for (const type of allTypes) {
        let url = await axios.get(type.url);
        types.push(url.data);
      }
      const pokemonType = types.map((result) => ({
        id: result.id,
        name: result.name,
      }));
      await Type.bulkCreate(pokemonType)
      return res.status(200).json(pokemonType);
    }
    return res.status(200).json(pokemonTypes);
  } catch (error) {
    return res.status(500).send(error.message);
  }
}; 

module.exports = {
  getTypes,
};
 