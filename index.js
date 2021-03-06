const { Client, MessageEmbed } = require("discord.js");
const debugFunctions = require("./debugFunctions");
const {
    CardHunter,
    CardMummy,
    CardSkeleton,
    CardVampire,
    CardVillager,
    CardWerewolf,
    CardWitch,
    CardZombie,
} = require("./cards");

const bot = new Client();
const token = "Your bot token here";

const messageFunctions = {
    register: (msg) => registerUserFromMessage(msg),
    "list players": (msg) => listPlayers(msg.channel),
    start: (msg) => startGame(msg.channel),
    "debug.showCache": () => debugFunctions.showCache(bot.users.cache),
    "debug.listPlayers": () => debugFunctions.listPlayers(players),
    "debug.vars.cemitery": (msg) =>
        debugFunctions.varsCemitery(msg.channel, cemitery),
    "debug.vars.currentTurn": (msg) =>
        debugFunctions.varsCurrentTurn(msg.channel, currentTurn),
    "debug.vars.dayNightTurn": (msg) =>
        debugFunctions.varsDayNightTurn(msg.channel, dayNightTurn),
    "debug.vars.deck": (msg) => debugFunctions.varsDeck(msg.channel, deck),
    "debug.vars.isGameOn": (msg) =>
        debugFunctions.varsIsGameOn(msg.channel, isGameOn),
    "debug.vars.players": (msg) =>
        debugFunctions.varsPlayers(msg.channel, players),
    "debug.vars.playerCount": (msg) =>
        debugFunctions.varsPlayerCount(msg.channel, playerCount),
    "debug.vars.playerCards": (msg) =>
        debugFunctions.varsPlayerCards(msg.channel, playerCards),
    "debug.vars.hunterChosenIndex": (msg) =>
        debugFunctions.varsHunterChosenIndex(msg.channel, hunterChosenIndex),
    "debug.vars.zombieChosenIndex": (msg) =>
        debugFunctions.varsZombieChosenIndex(msg.channel, zombieChosenIndex),
    "debug.vars.vampireChosenIndex": (msg) =>
        debugFunctions.varsVampireChosenIndex(
            msg.channel,
            vampireChosenCemiteryIndex,
            vampireChosenPlayerIndex
        ),
    "debug.vars.pendingZombieNewActionExecution": (msg) =>
        debugFunctions.varsPendingZombieNewActionExecution(
            msg.channel,
            pendingZombieNewActionExecution
        ),
    "debug.help": (msg) => debugFunctions.help(msg.channel),
};

const performCharacterAction = {
    hunter: (msg) => performHunterAction(msg),
    witch: (msg) => performWitchAction(msg),
    zombie: (msg) => {
        if (pendingZombieNewActionExecution) {
            performZombieNewCardAction(msg);
        } else {
            performZombieAction(msg);
        }
    },
    vampire: (msg) => performVampireAction(msg),
};

bot.login(token);
bot.on("ready", () => {
    console.log("READY");
});

bot.on("message", (msg) => {
    if (msg.author.bot) {
        // Não faz nada
        return;
    }

    messageFunctions[msg.content](msg);
});

// Night actions
bot.on("message", (msg) => {
    if (msg.author.bot || msg.channel.type != "dm") {
        // Não faz nada
        return;
    }

    if (!isGameOn) {
        // Nada para ser feito agora
        return;
    }

    if (dayNightTurn != "night") {
        // Nada para ser feito aqui
        return;
    }

    if (currentTurn == null) {
        // Nada para ser feito aqui
        return;
    }

    // Verifica se a vez é a do author da mensageme
    const playerId = msg.author.id;
    const currentPlayerId = playerCards[currentTurn.id].player.id;

    if (playerId != currentPlayerId) {
        msg.channel.send("Aguarde a sua vez");
        return;
    }

    performCharacterAction[currentTurn.id](msg);
});

const registerUserFromMessage = (msg) => {
    if (isGameOn) {
        msg.channel.send("O jogo já começou");
        return;
    }

    const userId = msg.author.id;
    const userName = msg.author.username;

    const success = registerPlayer(userId, userName);

    if (success) {
        msg.channel.send("Jogador cadastrado com sucesso");
    } else {
        msg.channel.send("Jogador já cadastrado");
    }
};

// CRUD Players

var playerCount = 0;
var players = [];

const registerPlayer = (playerId, playerName) => {
    // procura jogador na lista de jogadores cadastrados
    let existingPlayer = players.find((x) => x.playerId === playerId);

    if (existingPlayer) {
        return false;
    }

    players[playerCount] = { id: playerId, name: playerName };
    playerCount++;
    return true;
};

const listPlayers = (channel) => {
    channel.send(players.map((player) => player.name).join(", "));
};

const forEachPlayer = (doSomething) => {
    for (var index in players) {
        const player = players[index];

        doSomething(player);
    }
};

// end CRUD Players

var playerCards = []; // [Card.id: { Player, DeckCard }]
var cemitery = []; // [DeckCard]
var deck = []; // [Card]
var containsTwoWerewolfs = false;

const createDeckCard = (card, instanceCount) => {
    return {
        id: card.id + "_" + instanceCount,
        card: card,
        instance: instanceCount,
    };
};

const chooseRandomly = (cardA, cardB) => {
    const randomBoolean = Math.random() < 0.5;

    if (randomBoolean) {
        return cardA;
    } else {
        return cardB;
    }
};

const deckToString = () => deck.map((x) => x.card.name).join(", ");

const forEachCardOnDeck = (doSomething) => {
    for (index in deck) {
        const deckCard = deck[index];
        doSomething(deckCard);
    }
};

const forEachPlayerCard = (doSomething) => {
    for (index in playerCards) {
        const playerCard = playerCards[index];
        doSomething(playerCard);
    }
};

const isCardOnDeck = (card) => {
    let isOnDeck = deck.find((x) => x.card.id === card.id);

    if (isOnDeck) {
        return true;
    }

    return false;
};

const isCardWithPlayer = (card) => {
    let isWithPlayer = false;

    playerCards.forEach((playerCard) => {
        if (card.id === playerCard.deckCard.card.id) {
            isWithPlayer = true;
        }
    });

    return isWithPlayer;
};

const prepareDeck = () => {
    switch (playerCount) {
        case 0:
        case 1:
        case 3:
            containsTwoWerewolfs = false;
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(chooseRandomly(CardMummy, CardSkeleton), 1),
                createDeckCard(CardZombie, 1),
            ];
            return true;
        case 4:
            containsTwoWerewolfs = true;
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardWerewolf, 2),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(chooseRandomly(CardMummy, CardSkeleton), 1),
                createDeckCard(CardZombie, 1),
            ];
            return true;
        case 5:
            containsTwoWerewolfs = true;
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardWerewolf, 2),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(CardMummy, 1),
                createDeckCard(CardSkeleton, 1),
                createDeckCard(CardZombie, 1),
            ];
            return true;
        case 6:
            containsTwoWerewolfs = true;
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardWerewolf, 2),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(CardMummy, 1),
                createDeckCard(CardSkeleton, 1),
                createDeckCard(CardZombie, 1),
                createDeckCard(CardVillager, 1),
            ];
            return true;
        case 6:
            containsTwoWerewolfs = true;
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardWerewolf, 2),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(CardMummy, 1),
                createDeckCard(CardSkeleton, 1),
                createDeckCard(CardZombie, 1),
                createDeckCard(CardVillager, 1),
                createDeckCard(CardVillager, 2),
            ];
            return true;
        default:
            return false;
    }
};

const dealCards = () => {
    let pickedCards = [];

    for (index in deck) {
        // Nenhuma carta selecionada
        pickedCards[index] = false;
    }

    players.forEach((player) => {
        let index = 0;
        do {
            index = Math.round(Math.random() * playerCount);
        } while (pickedCards[index]);

        const deckCard = deck[index];
        pickedCards[index] = true;

        playerCards[deckCard.card.id] = {
            player: player,
            deckCard: deckCard,
        };

        // Envia para o player a carta del
        const cardMessage = new MessageEmbed()
            .setTitle("Sua carta é " + deckCard.card.name)
            .setDescription(deckCard.card.description)
            .setColor(0xff0000);

        bot.users.cache.get(player.id).send(cardMessage);
    });

    // Põe as cartas não selecionadas no cemitério
    for (index in pickedCards) {
        if (pickedCards[index]) {
            continue;
        }

        const deckCard = deck[index];
        cemitery[cemitery.length] = deckCard;
    }
};

const beginHunterTurn = (asZombie) => {
    if (!isCardWithPlayer(CardHunter)) {
        // Hunter não está com nenhum jogador
        return false;
    }

    currentTurn = CardHunter;

    var playerCard;

    if (asZombie) {
        playerCard = playerCards[CardZombie.id];
    } else {
        playerCard = playerCards[CardHunter.id];
    }

    const player = playerCard.player;

    const playerChannel = bot.users.cache.get(player.id);

    if (!asZombie) {
        serverChannel.send("Acorde caçador! Comece sua caça...");
        playerChannel.send("Acorde caçador! Comece sua caça...");
    }

    playerChannel.send(
        "Escolha uma carta do cemitério digitando `1`, `2` ou `3`"
    );

    return true;
};

const onHunterTurnFinished = () => {
    if (pendingZombieNewActionExecution) {
        finishZombieAction();
        return;
    }

    const shouldWait = beginWitchTurn();

    if (shouldWait) {
        return;
    }
    setTimeout(function () {
        onWitchTurnFinished();
    }, 5000);
};

const performHunterAction = (msg) => {
    console.log("performHunterAction():", msg);

    if (msg.content == "1") {
        hunterChosenIndex = 0;
    } else if (msg.content == "2") {
        hunterChosenIndex = 1;
    } else if (msg.content == "3") {
        hunterChosenIndex = 2;
    } else {
        hunterChosenIndex = -1;
    }

    if (hunterChosenIndex == -1) {
        msg.channel.send(
            "Não entendi. Digite `1`, `2` ou `3` para escolher uma carta do cemitério"
        );
        return;
    }

    msg.channel.send("GG. Vou continuar lá no server o jogo");
    onHunterTurnFinished();
};

const beginWitchTurn = (asZombie) => {
    if (!asZombie) {
        serverChannel.send("Acorde Bruxa! Preveja o futuro de alguém...");
    }

    if (!isCardWithPlayer(CardWitch)) {
        // Witch não está com nenhum jogador
        return false;
    }

    currentTurn = CardWitch;

    var playerCard;

    if (asZombie) {
        playerCard = playerCards[CardZombie.id];
    } else {
        playerCard = playerCards[CardWitch.id];
    }

    const player = playerCard.player;

    var menu = "";
    var index = 1;
    forEachPlayer((player) => {
        if (menu == "") {
            menu = "`" + index + "` - " + player.name;
        } else {
            menu = menu + "\n`" + index + "` - " + player.name;
        }

        index++;
    });

    const playerChannel = bot.users.cache.get(player.id);

    if (!asZombie) {
        playerChannel.send("Acorde Bruxa! Preveja o futuro de alguém...");
    }

    playerChannel.send(
        "Escolha um jogador para ver a carta digitando o número correspondente:\n\n**Opções**:\n" +
            menu
    );

    return true;
};

const onWitchTurnFinished = () => {
    if (pendingZombieNewActionExecution) {
        finishZombieAction();
    }

    if (containsTwoWerewolfs) {
        beginWerewolfsTurn();
    } else {
        beginSoloWerewolfTurn();
    }

    onWerewolfTurnFinished();
};

const performWitchAction = (msg) => {
    console.log("performWitchAction():", msg);
    const index = parseInt(msg.content);

    if (index == NaN || index < 0 || index > playerCount - 1) {
        var menu = "";
        var i = 1;
        forEachPlayer((player) => {
            if (menu == "") {
                menu = "`" + i + "` - " + player.name;
            } else {
                menu = menu + "\n`" + i + "` - " + player.name;
            }
            i++;
        });

        msg.channel.send(
            "Escolha um jogador para ver a carta digitando o número correspondente:\n\n**Opções**:\n" +
                menu
        );
        return;
    }

    const playerIndex = index - 1;
    const chosenPlayer = players[playerIndex];

    forEachPlayerCard((playerCard) => {
        if (playerCard.player.id == chosenPlayer.id) {
            const card = playerCard.deckCard.card;
            msg.channel.send(
                "A carta do " + chosenPlayer.name + " é: " + card.name
            );
        }
    });

    msg.channel.send("GG. Vou continuar lá no server o jogo");
    onWitchTurnFinished();
};

const beginWerewolfsTurn = () => {
    serverChannel.send("Acorde Lobisomem! Forme sua alcatéia...");

    if (!isCardWithPlayer(CardWerewolf)) {
        // Werewolf não está com nenhum jogador
        return false;
    }

    currentTurn = CardWerewolf;

    var playerCardA, playerCardB;

    forEachPlayerCard((playerCard) => {
        if (playerCard.deckCard.card == CardWerewolf) {
            if (playerCardA == undefined) {
                playerCardA = playerCard;
            } else if (playerCardB == undefined) {
                playerCardB = playerCard;
            }
        }
    });

    beginWerewolfTurn(playerCardA, playerCardB.player);
    beginWerewolfTurn(playerCardB, playerCardA.player);

    return false;
};

const beginSoloWerewolfTurn = () => {
    serverChannel.send("Acorde Lobisomem! Forme sua alcatéia...");

    if (!isCardWithPlayer(CardWerewolf)) {
        // Werewolf não está com nenhum jogador
        return false;
    }

    currentTurn = CardWerewolf;

    const playerCard = playerCards[CardWerewolf.id];
    const player = playerCard.player;

    var cemiteryCards = "";

    for (index in cemitery) {
        if (index == hunterChosenIndex) {
            continue;
        }

        if (cemiteryCards == "") {
            cemiteryCards = cemitery[index].card.name;
        } else {
            cemiteryCards += ", " + cemitery[index].card.name;
        }
    }

    const playerChannel = bot.users.cache.get(player.id);
    playerChannel.send("Acorde Lobisomem! Forme sua alcatéia...");
    playerChannel.send("Cartas do cemitério: " + cemiteryCards);

    return false;
};

const beginWerewolfTurn = (playerCard, otherPlayer) => {
    const player = playerCard.player;

    var menu = "";
    var index = 1;
    forEachPlayer((player) => {
        if (menu == "") {
            menu = "`" + index + "` - " + player.name;
        } else {
            menu = menu + "\n`" + index + "` - " + player.name;
        }
        index++;
    });

    const playerChannel = bot.users.cache.get(player.id);
    playerChannel.send("Acorde Lobisomem! Forme sua alcatéia...");
    playerChannel.send("Seu parceiro é " + otherPlayer.name);
};

const onWerewolfTurnFinished = () => {
    const shouldWait = beginZombieTurn();
    if (shouldWait) {
        return;
    }

    setTimeout(function () {
        onZombieTurnFinished();
    }, 5000);
};

const beginZombieTurn = () => {
    serverChannel.send("Zumbi, levanta-te e escolha um corpo do cemitério...");

    if (!isCardWithPlayer(CardZombie)) {
        // Zombie não está com nenhum jogador
        return false;
    }

    currentTurn = CardZombie;

    const playerCard = playerCards[CardZombie.id];
    const player = playerCard.player;

    const playerChannel = bot.users.cache.get(player.id);
    playerChannel.send("Zumbi, levanta-te e escolha um corpo do cemitério...");

    if (hunterChosenIndex == -1) {
        playerChannel.send(
            "Escolha uma carta do cemitério digitando `1` ou `2`"
        );
    } else {
        playerChannel.send(
            "Escolha uma carta do cemitério digitando `1`, `2` ou `3`"
        );
    }

    return true;
};

const finishZombieAction = () => {
    pendingZombieNewActionExecution = false;
    onZombieTurnFinished();
};

const onZombieTurnFinished = () => {
    const zombieNewCard = cemitery[zombieChosenIndex];

    if (zombieNewCard != CardVampire) {
        const shouldWait = beginVampireTurn();

        if (shouldWait) {
            return;
        }

        setTimeout(function () {
            onVampireTurnFinished();
        }, 5000);
    } else {
        performDayRound();
    }
};

const performZombieAction = (msg) => {
    console.log("performZombieAction():", msg);

    const n = parseInt(msg.content);

    if (n == NaN) {
        if (hunterChosenIndex == -1) {
            playerChannel.send(
                "Não entendi. Escolha uma carta do cemitério digitando `1` ou `2`"
            );
        } else {
            playerChannel.send(
                "Não entendi. Escolha uma carta do cemitério digitando `1`, `2` ou `3`"
            );
        }
        return;
    }

    const chosenNumber = n - 1;
    if (hunterChosenIndex != -1 && hunterChosenIndex <= chosenNumber) {
        zombieChosenIndex = chosenNumber + 1;
    } else {
        zombieChosenIndex = chosenNumber;
    }

    const zombieNewCard = cemitery[zombieChosenIndex];
    const cardMessage = new MessageEmbed()
        .setTitle("Sua nova carta é " + zombieNewCard.card.name)
        .setDescription(zombieNewCard.card.description)
        .setColor(0xff0000);

    msg.channel.send(cardMessage);

    if (
        zombieNewCard.card.round == 0 ||
        (zombieNewCard.card == CardWerewolf && containsTwoWerewolfs)
    ) {
        finishZombieAction(msg.channel);
    } else {
        pendingZombieNewActionExecution = true;
        msg.channel.send(
            "Deseja executar a ação dessa carta? Digite `S` para Sim ou `N` para Não."
        );
    }
};

const performZombieNewCardAction = (msg) => {
    console.log("performZombieNewCardAction():", msg);

    if (
        msg.content == "Não" ||
        msg.content == "Nao" ||
        msg.content == "não" ||
        msg.content == "nao" ||
        msg.content == "N" ||
        msg.content == "n"
    ) {
        finishZombieAction(msg.channel);
        return;
    }

    if (
        msg.content != "Sim" &&
        msg.content != "sim" &&
        msg.content != "S" &&
        msg.content != "S"
    ) {
        playerChannel.send(
            "Não entendi. Deseja executar a ação dessa carta? Digite `S` para Sim ou `N` para Não."
        );
        return;
    }

    const zombieNewCard = cemitery[zombieNewCard];
    switch (zombieNewCard.card) {
        case CardHunter:
            beginHunterTurn(true);
            break;
        case CardWitch:
            beginWitchTurn(true);
            break;
        case CardVampire:
            beginVampireTurn(true);
            break;
    }
};

const beginVampireTurn = (asZombie) => {
    if (!asZombie) {
        serverChannel.send("Acorde vampiro! Sugue o sangue de uma vítima...");
    }

    if (!isCardWithPlayer(CardVampire)) {
        // Vampire não está com nenhum jogador
        return false;
    }

    currentTurn = CardVampire;

    var playerCard;
    if (asZombie) {
        playerCard = playerCards[CardZombie.id];
    } else {
        playerCard = playerCards[CardVampire.id];
    }

    const player = playerCard.player;
    const playerChannel = bot.users.cache.get(player.id);

    if (!asZombie) {
        playerChannel.send("Acorde vampiro! Sugue o sangue de uma vítima...");
    }

    var menu = "";
    var index = 1;
    forEachPlayer((player) => {
        if (menu == "") {
            menu = "`P" + index + "` - " + player.name;
        } else {
            menu = "\n`P" + index + "` - " + player.name;
        }

        index++;
    });

    if (hunterChosenIndex != -1) {
        if (zombieChosenIndex != -1) {
            playerChannel.send(
                "Escolha uma carta do cemitério digitando `C1` ou escolha uma carta de outro jogador digitando:\n" +
                    menu
            );
        } else {
            playerChannel.send(
                "Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" +
                    menu
            );
        }
    } else {
        if (zombieChosenIndex != -1) {
            playerChannel.send(
                "Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" +
                    menu
            );
        } else {
            playerChannel.send(
                "Escolha uma carta do cemitério digitando `C1`, `C2` ou `C3` ou escolha uma carta de outro jogador digitando:\n" +
                    menu
            );
        }
    }

    return true;
};

const onVampireTurnFinished = () => {
    if (pendingZombieNewActionExecution) {
        finishZombieAction();
        return;
    }

    performDayRound();
};

const performVampireAction = (msg) => {
    console.log("performVampireAction():", msg);

    var chosenCemitery = -1;
    var chosenPlayer = -1;

    if (msg.content == "C1") {
        chosenCemitery = 0;
    } else if (msg.content == "C2") {
        chosenCemitery = 1;
    } else if (msg.content == "C3") {
        chosenCemitery = 2;
    } else if (msg.content == "P1") {
        chosenPlayer = 0;
    } else if (msg.content == "P2") {
        chosenPlayer = 1;
    } else if (msg.content == "P3") {
        chosenPlayer = 2;
    } else if (msg.content == "P4") {
        chosenPlayer = 3;
    } else if (msg.content == "P5") {
        chosenPlayer = 4;
    } else if (msg.content == "P6") {
        chosenPlayer = 5;
    } else if (msg.content == "P7") {
        chosenPlayer = 6;
    } else {
        if (hunterChosenIndex != -1) {
            if (zombieChosenIndex != -1) {
                playerChannel.send(
                    "Escolha uma carta do cemitério digitando `C1` ou escolha uma carta de outro jogador digitando:\n" +
                        menu
                );
            } else {
                playerChannel.send(
                    "Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" +
                        menu
                );
            }
        } else {
            if (zombieChosenIndex != -1) {
                playerChannel.send(
                    "Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" +
                        menu
                );
            } else {
                playerChannel.send(
                    "Escolha uma carta do cemitério digitando `C1`, `C2` ou `C3` ou escolha uma carta de outro jogador digitando:\n" +
                        menu
                );
            }
        }
        return;
    }

    if (chosenCemitery != -1) {
        var aux;

        if (hunterChosenIndex != -1 && hunterChosenIndex <= chosenCemitery) {
            aux = chosenCemitery + 1;
        } else {
            aux = chosenCemitery;
        }

        if (zombieChosenIndex != -1 && zombieChosenIndex <= chosenCemitery) {
            aux = chosenCemitery + 1;
        } else {
            aux = chosenCemitery;
        }

        if (hunterChosenIndex == aux || zombieChosenIndex == aux) {
            if (hunterChosenIndex != -1) {
                if (zombieChosenIndex != -1) {
                    playerChannel.send(
                        "Escolha uma carta do cemitério digitando `C1` ou escolha uma carta de outro jogador digitando:\n" +
                            menu
                    );
                } else {
                    playerChannel.send(
                        "Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" +
                            menu
                    );
                }
            } else {
                if (zombieChosenIndex != -1) {
                    playerChannel.send(
                        "Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" +
                            menu
                    );
                } else {
                    playerChannel.send(
                        "Escolha uma carta do cemitério digitando `C1`, `C2` ou `C3` ou escolha uma carta de outro jogador digitando:\n" +
                            menu
                    );
                }
            }
            return;
        } else {
            vampireChosenCemiteryIndex = aux;
        }

        const vampireNewCard = cemitery[vampireChosenCemiteryIndex];
        const cardMessage = new MessageEmbed()
            .setTitle("Sua nova carta é " + vampireNewCard.card.name)
            .setDescription(vampireNewCard.card.description)
            .setColor(0xff0000);

        msg.channel.send(cardMessage);

        onVampireTurnFinished();
        return;
    }

    if (chosenPlayer != -1) {
        vampireChosenPlayerIndex = chosenPlayer - 1;
        const vampireNewCard = cemitery[vampireChosenPlayerIndex];
        const cardMessage = new MessageEmbed()
            .setTitle("Sua nova carta é " + vampireNewCard.card.name)
            .setDescription(vampireNewCard.card.description)
            .setColor(0xff0000);

        msg.channel.send(cardMessage);

        onVampireTurnFinished();
        return;
    }
};

// end Cards

var isGameOn = false;
var dayNightTurn = null;
var currentTurn = null;
var serverChannel = false;
var hunterChosenIndex = -1;
var zombieChosenIndex = -1;
var vampireChosenCemiteryIndex = -1;
var vampireChosenPlayerIndex = -1;
var pendingZombieNewActionExecution = false;

const startGame = (channel) => {
    if (isGameOn) {
        msg.channel.send("O jogo já começou");
        return;
    }

    const success = prepareDeck();

    if (success) {
        isGameOn = true;
        serverChannel = channel;
        serverChannel.send("O jogo está começando");
        serverChannel.send("Cartas no jogo:" + deckToString());
    } else {
        isGameOn = false;
        serverChannel = null;
        serverChannel.send("Número insuficiente de jogadores");
        return;
    }

    dealCards();
    currentPlayerIndex = 0;

    beginNightTurn();
};

const beginNightTurn = () => {
    dayNightTurn = "night";

    serverChannel.send("Anoiteceu");

    const shouldWaitHunter = beginHunterTurn();

    if (shouldWaitHunter) {
        return;
    }

    onHunterTurnFinished();
};

const performDayRound = () => {
    serverChannel.send("Amanheceu");
    serverChannel.send("fim do jogo");
    isGameOn = false;
};
