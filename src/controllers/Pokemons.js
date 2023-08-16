require("dotenv").config();
const axios = require("axios");
const { URL } = process.env;
const { Pokemon, Type } = require("../db");
const { validateUuid } = require("../helpers/validateUUID");
const { Op } = require("sequelize");
const { getPokemonsDb } = require("../helpers/pokeDb");

const getPokemons = async (req, res) => {
  try {
    let { data } = await axios.get(`${URL}?limit=150`);
    let allPokemons = data.results;
    let pokemons = [];
    for (const pokemon of allPokemons) {
      let url = await axios.get(pokemon.url);
      pokemons.push(url.data);
    }
    let apiPokemons = pokemons.map((pokemon) => {
      return {
        id: pokemon.id,
        name: pokemon.name,
        image: pokemon.sprites.other.home.front_default,
        healthPoints: pokemon.stats[0].base_stat,
        attack: pokemon.stats[1].base_stat,
        defense: pokemon.stats[2].base_stat,
        speed: pokemon.stats[5].base_stat,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types.map((e) => {
          return {name : e.type.name}
        }),
      };
    });
    const pokemonsDb = await getPokemonsDb();
    return res.status(200).json([...pokemonsDb, ...apiPokemons]);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getPokemonsByName = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    getPokemons(req, res);
  } else {
    try {
      let pokemons = await Pokemon.findOne({
        where: { name: { [Op.iRegexp]: `${name}` } }, include: [{model: Type, attributes: ["name"] , through: {attributes: []}}]
      });
      if (!pokemons) {
        const { data } = await axios.get(`${URL}/${name.toLowerCase()}`);
        if (data.name) {
          const pokemon = {
            id: data.id,
            name: data.name,
            image: data.sprites.other.home.front_default,
            healthPoints: data.stats[0].base_stat,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            speed: data.stats[5].base_stat,
            height: data.height,
            weight: data.weight,
            types: data.types.map((e) => {
              return {name : e.type.name};
            }),
          };
          return res.status(200).json([pokemon]);
        }
      }
      return res.status(200).json([pokemons]);
    } catch (error) {
      res.status(200).json([]);
    }
  }
};

const getPokemonsById = async (req, res) => {
  const { id } = req.params;

  try {
    if (validateUuid(id)) {
      const pokemonDb = await Pokemon.findByPk(id, {include : [{model: Type, attributes: ["name"]}]});
      return res.status(200).json(pokemonDb);
    } else {
      const { data } = await axios.get(`${URL}/${id}`);
      const apiPokemon = {
        name: data.name,
        image: data.sprites.other.home.front_default,
        healthPoints: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        speed: data.stats[5].base_stat,
        height: data.height,
        weight: data.weight,
        types: data.types.map((e) => {
          return {name : e.type.name};
        }),
      };
      return res.status(200).json(apiPokemon);
    }
  } catch (error) {
    res.status(500).json({ error: "ID invalid" });
  }
};

const postPokemons = async (req, res) => {
  try {
    const {
      name,
      image,
      healthPoints,
      attack,
      defense,
      speed,
      height,
      weight,
      types,
    } = req.body;

    if (!name || !image || !healthPoints || !attack || !defense || !types)
      return res.status(400).send("more pokeinfo is required");

    if (!types.length)
      return res.status(400).send("must have at least one type of pokemon");

    const existPokemon = await Pokemon.findOne({ where: { name } });
    if (existPokemon) {
      return res.status(404).send("this pokemon already exists");
    }

    const typeOfPokemon = await Type.findAll({ where: { name: types } });
    const newPokemon = await Pokemon.create({
      name,
      image,
      healthPoints,
      attack,
      defense,
      speed,
      height,
      weight,
    });

    await newPokemon.addType(typeOfPokemon);
    return res.status(200).json(newPokemon);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getPokemons,
  getPokemonsById,
  getPokemonsByName,
  postPokemons,
};
