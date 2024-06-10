// external modules
const inquirer = require('inquirer');
const chalk = require('chalk');

// internal modules
const fs  = require('fs');

const accountDir = 'accounts';
console.log('Accouts is running...');

operation();

function operation () {

    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que deseja fazer?',
        choices: ['Criar Conta', 'Consultar Saldo', 'Depositar', 'Sacar', 'Sair'],
    }]).then((answer) => {
        const action = answer['action'];
        switch (action) {
            case 'Criar Conta':
                createAccount();
                break;
            case 'Consultar Saldo':
                checkBalance();
                break;
            case 'Depositar':
                deposit();
                break;
            case 'Sacar':
                withdraw();
                break;
            case 'Sair':
                console.log(chalk.bgBlue('Aplicação encerrada...'));
                process.exit();
        }
    })
    .catch((err) => {
        console.log(err);
    });
}

function createAccount() {
    console.log(chalk.bgGreen.bold('Parabéns por escolher o Accounts !!'));
    console.log(chalk.green('Defina as opções da sua conta a seguir: '));
    buildAccount();
}

function buildAccount() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite um nome para sua conta:',
    }])
    .then((answer) => {
        const accountName = answer['accountName'];

        console.info(accountName);

        if (!fs.existsSync(accountDir)) {
            fs.mkdirSync(accountDir);
        }
        if (fs.existsSync(`${accountDir}/${accountName}.json`)) {
            console.log(chalk.bgRed.bold('Esta conta ja existe !! Escolha outro nome.'));
            buildAccount();
            return;
        } else {
            fs.writeFileSync(`${accountDir}/${accountName}.json`, '{"balance": 0}', function(err) {
                console.log(err);
            });
            console.log(chalk.green('Parabéns, sua conta foi criada'));
            operation();
            return;
        }

    })
    .catch((err) => {
        console.log(err);
    });
}

function deposit() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?',
    }])
    .then((answer) => {
        const accountName = answer['accountName'];

        if (!checkAccount(accountName))
            return deposit();

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você deseja depoistar?',
        }])
        .then((answer) => {
            const amount = answer['amount'];
            addAmount(accountName, amount);
            operation();
        })
        .catch((err) => {
            console.log(err);
        });


    })
    .catch((err) => {
        console.log(err);
    });
}

function checkAccount(accountName) {
    const exists = fs.existsSync(`${accountDir}/${accountName}.json`);

    if (!exists) {
        console.log(chalk.bgRed(`A conta ${accountName} não existe.`));
    }

    return exists;
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if (!amount) {
        console.log(chalk.bgRed('Algum erro aconteceu'));
        return deposit();
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
    fs.writeFileSync(`${accountDir}/${accountName}.json`, JSON.stringify(accountData), (err) => {
        console.log(err);
    });
    
    console.log(chalk.green(`Foi depositado o valor ${amount}`));
    console.log(chalk.green(`Seu saldo atual é de ${accountData.balance}`));
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`${accountDir}/${accountName}.json`,  {
        encoding: 'utf8',
        flag: 'r',
    });

    return JSON.parse(accountJSON);
}

function checkBalance() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
    .then((answer) => {
        const accountName = answer['accountName'];
        
        if (!checkAccount(accountName)){
            return checkBalance();
        }
        
        const accountData = getAccount(accountName);
        console.log(chalk.green(`Saldo da conta: ${accountData.balance}`));
        operation();

    })
    .catch((err) => {
        console.log(err);
    });
}

function withdraw() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'De qual conta você deseja sacar?',
    }])
    .then((answer) => {
        const accountName = answer['accountName'];

        if (!checkAccount(accountName)){
            return withdraw();
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Qual valor você deseja sacar?'
        }])
        .then((answer) => {
            amount  = answer['amount'];
            const accountData = getAccount(accountName);

            if (!amount) {
                console.log(chalk.bgRed('Algum erro aconteceu'));
                return withdraw();
            }

            accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
            
            if (accountData.balance >= 0) {
                fs.writeFileSync(`${accountDir}/${accountName}.json`,JSON.stringify(accountData), (err) => {
                    console.log(err);
                });
                console.log(chalk.green('Saque realizado com sucesso!!'));
            } else {
                console.log(chalk.bgRed('Saldo insuficiente para este saque!!'))
            }
            operation();

        })
        .catch(err => console.log(err));        

    })
    .catch(err => console.log(err));
}