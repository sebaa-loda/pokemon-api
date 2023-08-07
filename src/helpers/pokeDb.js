const { Pokemon } = require("../db");

const getPokeDb = async (name) => {
  try {
    const pokes = await Pokemon.findAll();
    return pokes;
  } catch (error) {
    return [];
  }
};

module.exports = {
  getPokeDb,
};
