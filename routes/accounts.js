import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();


//metodo POST para cadastrar um conteudo
router.post('/', async (req, res, next) => {
  try {
    let account = req.body;

    //validando campos
    if (!account.name || account.balance == null) {
      throw new Error('Name e Balance sao obrigatorios.')
    }

    const data = JSON.parse(await readFile(global.fileName));
    
    //apenas os campos existentes serao aceitos
    account = { 
      id: data.nextId++, 
      name: account.name, 
      balance: account.balance
    };
    data.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(account);

    global.logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

//metodo GET para listar todos os conteudos
router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    delete data.nextId;
    res.send(data);
    global.logger.info('GET /account');
  } catch (err) {
    next(err);
  }
});

//metodo GET com parametro para listar apenas um conteudo  de id especifico
router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const account = data.accounts.find(
      account => account.id ===  parseInt(req.params.id))
    res.send(account);
    global.logger.info('GET /account/:id');
  } catch (err) {
    next(err);
  }
});

//metodo DELETE para deletar um conteudo recebendo id como parametro
router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts = data.accounts.filter(
      account => account.id !== parseInt(req.params.id));
    
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.end();
    global.logger.info(`DELETE /account/:id - ${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

//o metodo PUT utilizamos quando queremos atualizar todo um conteudo
router.put('/', async (req, res, next) => {
  try {
    const account = req.body;

    //validando campos
    if (!account.id || !account.name || account.balance == null) {
      throw new Error('Id, Name e Balance sao obrigatorios.')
    }

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(a => a.id === account.id);

    //validando o index (id)
    if (index === -1) {
      throw new Error('Registro nao encontrado.');
    }

    //apenas os campos existentes serao atualizados
    data.accounts[index].name = account.name;
    data.accounts[index].balance = account.balance;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    
    res.send(account);
    global.logger.info(`PUT /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

//o metodo PATH utilizamos quando queremos apenas atualizar um valor parcial
router.patch('/updateBalance', async (req, res, next) => {
  try {
    const account = req.body;

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(a => a.id === account.id);

    //validando campos
    if (!account.id || account.balance == null) {
      throw new Error('Id e Balance sao obrigatorios.')
    }

    //validando o index (id)
    if (index === -1) {
      throw new Error('Registro nao encontrado.');
    }

    data.accounts[index].balance = account.balance;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    
    res.send(data.accounts[index]);
    global.logger.info(`PATCH /account/updateBalance - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});


//tratamento de erros generico para todos os endpoints  
router.use((err, req, res, next) => {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  console.log(err);
  res.status(400).send({ error: err.message });
});

export default router;