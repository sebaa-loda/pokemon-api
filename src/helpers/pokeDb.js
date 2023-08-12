const { Pokemon, Type } = require("../db");

const getPokemonsDb = async () => {
  try {
    const pokemonsFromDb = await Pokemon.findAll({
      include: [{model : Type, through:{attributes : []}}]
    });
    return pokemonsFromDb;
  } catch (error) {
    return [];
  }
};

module.exports = {
  getPokemonsDb,
};
