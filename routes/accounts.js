import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let account = req.body;

    if (!account.name || account.balance == null) {
      throw new Error('Name e Balance são obrigatórios');
    }

    const data = JSON.parse(await readFile(global.fileName));

    account = {
      id: data.nextId++,
      name: account.name,
      balance: account.balance,
    };
    data.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.send(account);

    global.logger.info(
      `${req.method} ${req.baseUrl} - ${JSON.stringify(account)}`
    );
  } catch (err) {
    next(err);
  }
});

// liberado somente a rota abaixo com o uso do cors - necessita fazer o import
// router.get('/', cors(), async (req, res, next) => {
router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    delete data.nextId;
    res.send(data);
    global.logger.info(`${req.method} ${req.baseUrl}`);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const account = data.accounts.find(
      (account) => account.id === parseInt(req.params.id)
    );
    res.send(account);
    global.logger.info(`${req.method} ${req.baseUrl}`);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.accounts = data.accounts.filter(
      (account) => account.id !== parseInt(req.params.id)
    );
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
    global.logger.info(`${req.method} ${req.baseUrl} -  ${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const account = req.body;

    if (!account.id || !account.name || account.balance == null) {
      throw new Error('ID, Name e Balance são obrigatórios');
    }

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(
      (accounts) => accounts.id === account.id
    );

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    data.accounts[index].name = account.name;
    data.accounts[index].balance = account.balance;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.send(account);

    global.logger.info(
      `${req.method} ${req.baseUrl} -  ${JSON.stringify(account)}`
    );
  } catch (err) {
    next(err);
  }
});

router.patch('/updateBalance', async (req, res, next) => {
  try {
    const account = req.body;

    if (!account.id || account.balance == null) {
      throw new Error('ID e Balance são obrigatórios');
    }

    const data = JSON.parse(await readFile(global.fileName));
    const index = data.accounts.findIndex(
      (accounts) => accounts.id === account.id
    );

    if (index === -1) {
      throw new Error('Registro não encontrado');
    }

    data.accounts[index].balance = account.balance;
    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    res.end();
    global.logger.info(
      `${req.method} ${req.baseUrl} -  ${JSON.stringify(account)}`
    );
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
