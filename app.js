// Carregando módulos
const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const Postagem = mongoose.model("postagens");
require("./models/Postagem");
const Categoria = mongoose.model("categorias");
require("./models/Categoria");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);

// Configurações
// Sessão
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error"); //erro no login se a senha for errado ou email
  res.locals.user = req.user || null; //arm os dados do usuario logado, null caso n exista o usuario logado ira passar o valor null

  next();
});

//Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Mongoose
mongoose;
mongoose.Promise = global.Promise;

mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("Conectado ao mongo");
  })
  .catch((err) => {
    console.log("Erro ao se conectar: " + err);
  });
//Public
app.use(express.static(path.join(__dirname, "public"))); //essa linha de codigo diz para o express que a pasta que ta guardando todo os nossos arquivos estaticos e a pasta public. join e __dirname pega o caminho e diretorio absoluto para a pasta public, isso evita muitos erros.

app.use((req, res, next) => {
  console.log("oi testando o middleware");
  next();
});

// Rotas
app.get("/", (req, res) => {
  Postagem.find()
    .lean()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })

    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
  const slug = req.params.slug;
  Postagem.findOne({ slug })
    .then((postagem) => {
      if (postagem) {
        const post = {
          titulo: postagem.titulo,
          data: postagem.data,
          conteudo: postagem.conteudo,
        };
        res.render("postagem/index", post);
      } else {
        req.flash("error_msg", "Essa postagem nao existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/categorias", (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
      res.redirect("/");
    });
});

app.get("/categoria/:slug", async (req, res) => {
  try {
    const categoria = await Categoria.findOne({ slug: req.params.slug }).lean();

    if (!categoria) {
      req.flash("error_msg", "Esta categoria não existe");
      return res.redirect("/");
    }

    const postagens = await Postagem.find({ categoria: categoria._id }).lean();

    res.render("categorias/postagens", {
      postagens,
      categoria,
    });
  } catch (err) {
    console.error(err);
    req.flash(
      "error_msg",
      "Houve um erro interno ao carregar a página desta categoria"
    );
    res.redirect("/");
  }
});

app.use("/usuarios", usuarios);
app.use("/admin", admin); //admin, e passando a constante admin
// Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("Servidor rodando! ");
});
