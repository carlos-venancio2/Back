// Rota para lidar com a inserção de uma nova solicitação

// URL base da solicitação do produto: http://localhost:3000/solicitacao/
/*
Modelo para testes no postman: 

{
  "fk_produtoId": 1,
  "qtd": 50,
  "preco": 550,
  "fk_tipoMoviId": 2,
  "fk_usuarioId": 2,
}
*/

//Nome do banco no Xampp: signup (aí é só importar o login lá que já funciona)

const express = require('express');

const router = express.Router();

const createDBConnection = require('../../db')
const db = createDBConnection()

// const bodyParser = require('body-parser');
// const app = express()
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: true}))

// const dataAtual = new Date();
// const today = dataAtual.getDate();
const dataAtual = new Date();
const today = dataAtual.toISOString().split('T')[0];

router.post("/", async (req, res) => {
  let {
    qtdEntrada,
    qtdSaida,
    fk_tipoMoviId,
    fk_usuarioId,
    fk_qtdItemId,
    fk_cadItemId,
    status,
    valor_entrada
  } = req.body;
  // let status = req.body

  // let defaultStatus = "novo";

  if (!fk_usuarioId || !fk_qtdItemId || !fk_cadItemId) {
    return res.status(400).json({
      message: 'Todos os campos são obrigatórios!'
    })
  }

  if (!status) {
    //  const new_status = "novo";
    //  let status = new_status ;

    //  const data = req.body;
    //  console.log("Name: ", data.name);
    // req.body.status = "novo",

    //  console.log("novo", status)
    // req.body.status = "novo"
    // status == defaultStatus

    status = "novo"
  } else {
    status = req.body.status;
  }
  console.log("status", status)

  if (!qtdEntrada && !qtdSaida) {
    return res.status(400).json({
      message: 'Quantidade obrigatória'
    })
  }

  if (qtdEntrada && qtdSaida) {
    return res.status(400).json({
      message: 'Apenas uma quantidade deve ser especificada!'
    })
  }
  if (qtdEntrada && !qtdSaida) {
    // const new_qtdSaida = 0
    // // req.body.qtdSaida = 0;
    // let qtdSaida = new_qtdSaida 

    qtdSaida = 0
  }

  if (qtdSaida && !qtdEntrada) {
    // req.body.qtdEntrada = 0;
    qtdEntrada = 0
    valor_entrada = 0
  }
  if (!qtdEntrada) {
    valor_entrada = 0
  }

  if (qtdEntrada > 0) {
    //   req.body.fk_tipoMoviId == 1;
    fk_tipoMoviId = 1
    valor_entrada > 0
  }

  if (qtdSaida > 0) {
    // req.body.fk_tipoMoviId == "2";
    fk_tipoMoviId = 2
  }
  const new_fk_tipoMoviId = parseInt(fk_tipoMoviId)
  const new_fk_usuarioId = parseInt(fk_usuarioId)
  const new_fk_qtdItemId = parseInt(fk_qtdItemId)
  const new_fk_cadItemId = parseInt(fk_cadItemId)

  // console.log(typeof new_fk_cadItemId)
  // console.log(typeof new_fk_tipoMoviId)
  // console.log(typeof new_fk_usuarioId)
  // console.log(typeof new_fk_cadItemId)
  // console.log(new_fk_cadItemId)
  // console.log(new_fk_tipoMoviId)
  // console.log("usuario", new_fk_usuarioId)
  // console.log(new_fk_cadItemId)

  if (!Number.isInteger(new_fk_tipoMoviId) || !Number.isInteger(new_fk_usuarioId) || !Number.isInteger(new_fk_qtdItemId) || !Number.isInteger(new_fk_cadItemId)) {
    return res.status(400).json({
      message: 'Insira os IDs como um número inteiro'
    });
  }

  const validationUsuario = "SELECT COUNT(*) AS count FROM usuarios WHERE usuarioId = ?";
  db.query(validationUsuario, [new_fk_usuarioId], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }
    const usuarioExists = result[0].count > 0;
    if (!usuarioExists) {
      return res.status(400).json({
        message: "Usuário invalido"
      });
    }

    const validationQtdProduto = "SELECT COUNT(*) AS count FROM qtditem WHERE qtdItem_id = ?";
    db.query(validationQtdProduto, [new_fk_qtdItemId], (err, result) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }
      const qtdProdutoExists = result[0].count > 0;
      if (!qtdProdutoExists) {
        return res.status(400).json({
          message: "Item invalido (qtd)"
        });
      }
      const validationProduto = "SELECT COUNT(*) AS count FROM qtditem WHERE fk_cadItemId = ?";
      db.query(validationProduto, [new_fk_cadItemId], (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }
        const qtdProdutoExists = result[0].count > 0;
        if (!qtdProdutoExists) {
          return res.status(400).json({
            message: "Item invalido (cad)"
          });
        }

        const validationValorEntrada = qtdEntrada > 0 && valor_entrada <= 0;
        if (validationValorEntrada) {
          return res.status(400).json({
            message: "Valor Inválido"
          });
        }

        const sql = "INSERT INTO solicitacaoproduto (`data`, `qtdEntrada`,`qtdSaida`, `fk_tipoMoviId`,`fk_usuarioId`, `fk_qtdItemId`, `fk_cadItemId`, `status`, `valor_entrada`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"

        const values = [
          today,
          qtdEntrada,
          qtdSaida,
          new_fk_tipoMoviId,
          new_fk_usuarioId,
          new_fk_qtdItemId,
          new_fk_cadItemId,
          status,
          valor_entrada
        ];

        db.query(sql, values, (err, data) => {
          if (err) {
            return res.status(500).json({
              error: err.message
            });
          } else {
            res.status(201).json({
              message: 'Dados inseridos no sistema com sucesso'
            })
          }
        });
      });
    })
  })
})


router.get('/', (req, res) => {
  const sql = "SELECT solicId, data, qtdEntrada, qtdSaida, fk_tipoMoviId, fk_usuarioId, fk_qtdItemId, status, valor_entrada FROM solicitacaoproduto";
  const values = [req.body.solicId, req.body.data, req.body.qtdEntrada, req.body.qtdSaida, req.body.fk_tipoMoviId, req.body.fk_usuarioId, req.body.fk_qtdItemId, req.body.valor_entrada];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    } else {
      res.status(201).json(data);
    }
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT solicId, data, qtdEntrada, qtdSaida, fk_tipoMoviId, fk_usuarioId, fk_qtdItemId, status, valor_entrada FROM solicitacaoproduto WHERE solicId = ?";
  const values = [id];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }
    if (data.length === 0) {
      return res.status(404).json({
        message: 'Solicitação não encontrada'
      });
    }
    res.status(200).json(data[0]);
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  let {
    qtdEntrada,
    qtdSaida,
    fk_tipoMoviId,
    fk_usuarioId,
    fk_qtdItemId,
    fk_cadItemId,
    status,
    valor_entrada
  } = req.body;

  console.log(status)

  if (!fk_usuarioId || !fk_qtdItemId || !fk_cadItemId) {
    return res.status(400).json({
      message: 'Todos os campos são obrigatórios!'
    })
  }

  if (!status) {
    status = "novo";
  } else {
    status = req.body.status;
  }
  console.log("status", status)

  if (!qtdEntrada && !qtdSaida) {
    return res.status(400).json({
      message: 'Quantidade obrigatória'
    })
  }

  if (qtdEntrada && qtdSaida) {
    return res.status(400).json({
      message: 'Apenas uma quantidade deve ser especificada!'
    })
  }
  if (qtdEntrada && !qtdSaida) {
    qtdSaida = 0
  }

  if (qtdSaida && !qtdEntrada) {
    qtdEntrada = 0
    valor_entrada = 0
  }

  if (qtdEntrada > 0) {
    fk_tipoMoviId = 1
  }
  if (qtdSaida > 0) {
    fk_tipoMoviId = 2
  }
  const new_fk_tipoMoviId = parseInt(fk_tipoMoviId)
  const new_fk_usuarioId = parseInt(fk_usuarioId)
  const new_fk_qtdItemId = parseInt(fk_qtdItemId)
  const new_fk_cadItemId = parseInt(fk_cadItemId)

  // console.log(typeof new_fk_cadItemId)
  // console.log(typeof new_fk_tipoMoviId)
  // console.log(typeof new_fk_usuarioId)
  // console.log(typeof new_fk_cadItemId)
  // console.log(new_fk_cadItemId)
  // console.log(new_fk_tipoMoviId)
  // console.log("usuario", new_fk_usuarioId)
  // console.log(new_fk_cadItemId)

  if (!Number.isInteger(new_fk_tipoMoviId) || !Number.isInteger(new_fk_usuarioId) || !Number.isInteger(new_fk_qtdItemId) || !Number.isInteger(new_fk_cadItemId)) {
    return res.status(400).json({
      message: 'Insira os IDs como um número inteiro'
    });
  }

  const validationUsuario = "SELECT COUNT(*) AS count FROM usuarios WHERE usuarioId = ?";
  db.query(validationUsuario, [new_fk_usuarioId], (err, result) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }
    const usuarioExists = result[0].count > 0;
    if (!usuarioExists) {
      return res.status(400).json({
        message: "Usuário invalido"
      });
    }

    const validationQtdProduto = "SELECT COUNT(*) AS count FROM qtditem WHERE qtdItem_id = ?";
    db.query(validationQtdProduto, [new_fk_qtdItemId], (err, result) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }
      const qtdProdutoExists = result[0].count > 0;
      if (!qtdProdutoExists) {
        return res.status(400).json({
          message: "Item invalido (qtd)"
        });
      }
      const validationProduto = "SELECT COUNT(*) AS count FROM qtditem WHERE fk_cadItemId = ?";
      db.query(validationProduto, [new_fk_cadItemId], (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }
        const qtdProdutoExists = result[0].count > 0;
        if (!qtdProdutoExists) {
          return res.status(400).json({
            message: "Item invalido (cad)"
          });
        }
        const validationValorEntrada = qtdEntrada > 0 && valor_entrada <= 0;
        if (validationValorEntrada) {
          return res.status(400).json({
            message: "Valor Inválido"
          });
        }

        const sql = "UPDATE solicitacaoproduto SET data = ?, qtdEntrada = ?, qtdSaida = ?, fk_tipoMoviId = ?, fk_usuarioId = ?, fk_qtdItemId = ?, status =?, valor_entrada = ? WHERE solicId = ?";
        const values = [
          today, 
          qtdEntrada, 
          qtdSaida, 
          new_fk_tipoMoviId, 
          new_fk_usuarioId, 
          new_fk_qtdItemId, 
          status,
          valor_entrada, 
          id];

        db.query(sql, values, (err, data) => {
          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }
          if (data.length === 0) {
            return res.status(404).json({
              message: 'Solicitação não encontrada'
            });
          }
          res.status(200).json({
            message: 'Dados atualizados do sistema com sucesso'
          });
        });
      });
    });
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM solicitacaoproduto WHERE solicId = ?";
  const values = [id];

  db.query(sql, values, (err, data) => {
    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }
    if (data.length === 0) {
      return res.status(404).json({
        message: 'Solicitacao não encontrada'
      });
    }
    res.status(200).json({
      message: 'Dados deletados do sistema com sucesso'
    });
  });
});

module.exports = router