const mongoose = require("mongoose");
const { Schema } = mongoose;

const UsuarioSchema = new Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Garantir que o email seja único
  },
  eAdmin: {
    type: Number,
    default: 0,
  },
  senha: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("usuarios", UsuarioSchema);
