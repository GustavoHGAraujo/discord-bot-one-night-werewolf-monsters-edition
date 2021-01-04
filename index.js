const { Client, MessageEmbed } = require('discord.js')
const bot = new Client()
const token = 'Your bot token here'

bot.login(token)
bot.on('ready', () => {
    console.log('READY')
})

bot.on('message', msg => {
    if (msg.author.bot) {
        // Não faz nada
        return
    }

    switch (msg.content) {
        case 'register':
            registerUserFromMessage(msg)
            break;

        case 'list players':
            listPlayers(msg.channel)
            break;

        case 'start':
            startGame(msg.channel)
            break;

        case 'debug.showCache':
            console.log(bot.users.cache)
            break;

        case 'debug.listPlayers':
            console.log(players)
            msg.channel.send(JSON.stringify(players));
            break;
            
        case 'debug.vars.cemitery':
            console.log("cemitery:", cemitery)
            msg.channel.send(JSON.stringify({
                cemitery: cemitery
            }))
            break;
            
        case 'debug.vars.currentTurn':
            console.log("currentTurn:", currentTurn)
            msg.channel.send(JSON.stringify({
                currentTurn: currentTurn
            }))
            break;
            
        case 'debug.vars.dayNightTurn':
            console.log("dayNightTurn:", dayNightTurn)
            msg.channel.send(JSON.stringify({
                dayNightTurn: dayNightTurn
            }))
            break;

        case 'debug.vars.deck':
            console.log("deck:", deck)
            msg.channel.send(JSON.stringify({
                deck: deck
            }))
            break;

        case 'debug.vars.isGameOn':
            console.log("isGameOn:", isGameOn)
            msg.channel.send(JSON.stringify({
                isGameOn: isGameOn
            }))
            break;

        case 'debug.vars.players':
            console.log("players:", players)
            msg.channel.send(JSON.stringify({
                players: players
            }))
            break;

        case 'debug.vars.playerCount':
            console.log("playerCount:", playerCount)
            msg.channel.send(JSON.stringify({
                playerCount: playerCount
            }))
            break;

        case 'debug.vars.playerCards':
            console.log("playerCards:", playerCards)
            msg.channel.send(JSON.stringify({
                playerCards: playerCards
            }))
            break;

        case 'debug.vars.hunterChosenIndex':
            console.log("hunterChosenIndex:", hunterChosenIndex)
            msg.channel.send(JSON.stringify({
                hunterChosenIndex: hunterChosenIndex
            }))
            break;

        case 'debug.vars.zombieChosenIndex':
            console.log("zombieChosenIndex:", zombieChosenIndex)
            msg.channel.send(JSON.stringify({
                zombieChosenIndex: zombieChosenIndex
            }))
            break;

        case 'debug.vars.vampireChosenIndex':
            console.log("vampireChosenCemiteryIndex:", vampireChosenCemiteryIndex)
            console.log("vampireChosenPlayerIndex:", vampireChosenPlayerIndex)
            msg.channel.send(JSON.stringify({
                cemiteryIndex: vampireChosenCemiteryIndex,
                playerIndex: vampireChosenPlayerIndex
            }))
            break;

        case 'debug.vars.pendingZombieNewActionExecution':
            console.log("pendingZombieNewActionExecution:", pendingZombieNewActionExecution)
            msg.channel.send(JSON.stringify({
                pendingZombieNewActionExecution: pendingZombieNewActionExecution
            }))
            break;

        case 'debug.help':
            msg.channel.send(
                "**Opções:**\n"  +
                "`debug.showCache`\n" + 
                "`debug.listPlayers`\n" + 
                "`debug.vars.cemitery`\n" + 
                "`debug.vars.currentTurn`\n" + 
                "`debug.vars.dayNightTurn`\n" + 
                "`debug.vars.deck`\n" + 
                "`debug.vars.isGameO`\n" + 
                "`debug.vars.players`\n" + 
                "`debug.vars.playerCount`\n" + 
                "`debug.vars.playerCards`\n" + 
                "`debug.vars.hunterChosenIndex`\n" + 
                "`debug.vars.zombieChosenIndex`\n" + 
                "`debug.vars.vampireChosenIndex`\n" + 
                "`debug.vars.pendingZombieNewActionExecution`"
            )
        
    }
})

// Night actions
bot.on('message', msg => {
    if (msg.author.bot || msg.channel.type != "dm") {
        // Não faz nada
        return
    }

    if (!isGameOn) {
        // Nada para ser feito agora
        return
    }

    if (dayNightTurn != "night") {
        // Nada para ser feito aqui
        return
    }

    if (currentTurn == null) {
        // Nada para ser feito aqui
        return
    }

    // Verifica se a vez é a do author da mensageme
    const playerId = msg.author.id
    const currentPlayerId = playerCards[currentTurn.id].player.id

    if (playerId != currentPlayerId) {
        msg.channel.send("Aguarde a sua vez")
        reeturn
    }

    switch (currentTurn) {
        case CardHunter:
            performHunterAction(msg)
            break;
        case CardWitch:
            performWitchAction(msg)
            break;
        case CardZombie:
            if (pendingZombieNewActionExecution) {
                performZombieNewCardAction(msg)
            } else {
                performZombieAction(msg)
            }
            break;
        case CardVampire:
            performVampireAction(msg)
            break;
    }    
})

function registerUserFromMessage(msg) {
    if (isGameOn) {
        msg.channel.send("O jogo já começou")
        return
    }

    const userId = msg.author.id
    const userName = msg.author.username

    const success = registerPlayer(userId, userName);

    if (success) {
        msg.channel.send("Jogador cadastrado com sucesso")
    } else {
        msg.channel.send("Jogador já cadastrado")
    }
}

// CRUD Players

var playerCount = 0
var players = []

function registerPlayer(playerId, playerName) {
    // procura jogador na lista de jogadores cadastrados
    for (index in players) {
        const player = players[index]
        if (player.id == playerId) {
            // jogador já cadastrado
            return false;
        }
    }

    players[playerCount] = { id: playerId, name: playerName }
    playerCount++;
    return true
}

function listPlayers(channel) {
    var playersNames = ""

    forEachPlayer(player => {
        if (playersNames == "") {
            playersNames = player.name
        } else {
            playersNames = playersNames + ", " + player.name
        }
    })

    channel.send(playersNames)
}

function forEachPlayer(doSomething) {
    for (var index in players) {
        const player = players[index]

        doSomething(player)
    }
}

// end CRUD Players

// Cards

const CardWerewolf = {
    id: "werewolf",
    name: "Lobisomem",
    round: 3,
    description: "Sobreviva  mat os aldeões. Voce pode ver as cartas do cemitério"
}

const CardVampire = {
    id: "vampire",
    name: "Vampiro",
    round: 5,
    description: "Pod trocar esta carta por uma de outro jogador ou do cemitério. (Caso pgue a carta de Zumbi, utilize a habilidade)"
}

const CardHunter = {
    id: "hunter",
    name: "Caçador",
    round: 1,
    description: "Esconda, sem olhar, uma carta do cemitério. Se o Caçador sobreviver e a carta for um Lobisomem, os Aldeões vencem."
}

const CardWitch = {
    id: "witch",
    name: "Bruxa",
    round: 2,
    description: "Pode ver a carta de outro jogador"
}

const CardMummy = {
    id: "mummy",
    name: "Múmia",
    round: 0,
    description: "Faça com que você seja o escolhido para morrer."
}

const CardSkeleton = {
    id: "skeleton",
    name: "Esqueleto",
    round: 0,
    description: "Faça com que você seja o escolhido para morrer."
}

const CardVillager = {
    id: "villager",
    name: "Aldeão",
    round: 0,
    description: "Tente sobreviver... Cuidado com os Lobisomens!"
}

const CardZombie = {
    id: "zombie",
    name: "Zumbi",
    round: 4,
    description: "Esconda esta carta. Pegue uma carta do cemitério e caso deseje, utilize a habilidade."
}

var playerCards = [] // [Card.id: { Player, DeckCard }]
var cemitery = [] // [DeckCard]
var deck = [] // [Card]
var containsTwoWerewolfs = false

function createDeckCard(card, instanceCount) {
    return {
        id: card.id + "_" + instanceCount,
        card: card,
        instance: instanceCount
    }
}

function chooseRandomly(cardA, cardB) {
    const randomBoolean = Math.random() < 0.5;

    if (randomBoolean) {
        return cardA
    } else {
        return cardB
    }
}

function deckToString() {
    var deckAsString = ""

    for (index in deck) {
        const deckCard = deck[index]
        const card = deckCard.card

        if (deckAsString == "") {
            deckAsString = card.name
        } else {
            deckAsString += ", " + card.name
        }
    }

    return deckAsString
}

function forEachCardOnDeck(doSomething) {
    for (index in deck) {
        const deckCard = deck[index]
        doSomething(deckCard)
    }
}

function forEachPlayerCard(doSomething) {
    for (index in playerCards) {
        const playerCard = playerCards[index]
        doSomething(playerCard)
    }
}

function isCardOnDeck(card) {
    var isOnDeck = false

    forEachCardOnDeck(deckCard => {
        if (card.id == deckCard.card.id) {
            isOnDeck = true
        }
    })

    return isOnDeck
}

function isCardWithPlayer(card) {
    var isWithPlayer = false

    forEachPlayerCard(playerCard => {
        if (card.id == playerCard.deckCard.card.id) {
            isWithPlayer = true
        }
    })

    return isWithPlayer
}

function prepareDeck() {
    switch(playerCount) {
        case 0:
        case 1:
        case 3:
            containsTwoWerewolfs = false
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(chooseRandomly(CardMummy, CardSkeleton), 1),
                createDeckCard(CardZombie, 1),
            ]
            return true
        case 4:
            containsTwoWerewolfs = true
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardWerewolf, 2),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(chooseRandomly(CardMummy, CardSkeleton), 1),
                createDeckCard(CardZombie, 1),
            ]
            return true
        case 5:
            containsTwoWerewolfs = true
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardWerewolf, 2),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(CardMummy, 1),
                createDeckCard(CardSkeleton, 1),
                createDeckCard(CardZombie, 1),
            ]
            return true
        case 6:
            containsTwoWerewolfs = true
            deck = [
                createDeckCard(CardWerewolf, 1),
                createDeckCard(CardWerewolf, 2),
                createDeckCard(CardHunter, 1),
                createDeckCard(CardWitch, 1),
                createDeckCard(CardVampire, 1),
                createDeckCard(CardMummy, 1),
                createDeckCard(CardSkeleton, 1),
                createDeckCard(CardZombie, 1),
                createDeckCard(CardVillager, 1)
            ]
            return true
        case 6:
            containsTwoWerewolfs = true
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
                createDeckCard(CardVillager, 2)
            ]
            return true
        default:
            return false
    }
}

function dealCards() {
    var pickedCards = []

    for (index in deck) {
        // Nenhuma carta selecionada
        pickedCards[index] = false
    }

    forEachPlayer(player => {
        var index = 0
        do {
            index = Math.round(Math.random() * playerCount)
        } while (pickedCards[index])

        const deckCard = deck[index]
        pickedCards[index] = true

        playerCards[deckCard.card.id] = {
            player: player,
            deckCard: deckCard
        }

        // Envia para o player a carta del
        const cardMessage = new MessageEmbed()
            .setTitle("Sua carta é " + deckCard.card.name)
            .setDescription(deckCard.card.description)
            .setColor(0xff0000)

        bot.users.cache.get(player.id).send(cardMessage)
    })

    // Põe as cartas não selecionadas no cemitério
    for (index in pickedCards) {
        if (pickedCards[index]) {
            continue;
        }

        const deckCard = deck[index]
        cemitery[cemitery.length] = deckCard
    }
}


function beginHunterTurn(asZombie) {
    if (!isCardWithPlayer(CardHunter)) {
        // Hunter não está com nenhum jogador
        return false
    }

    currentTurn = CardHunter

    var playerCard

    if (asZombie) {
        playerCard = playerCards[CardZombie.id]
    } else {
        playerCard = playerCards[CardHunter.id]
    }

    const player = playerCard.player

    const playerChannel = bot.users.cache.get(player.id)

    if (!asZombie) {
        serverChannel.send("Acorde caçador! Comece sua caça...")
        playerChannel.send("Acorde caçador! Comece sua caça...")
    }

    playerChannel.send("Escolha uma carta do cemitério digitando `1`, `2` ou `3`")

    return true
}

function onHunterTurnFinished() {
    if (pendingZombieNewActionExecution) {
        finishZombieAction()
        return
    }

    const shouldWait = beginWitchTurn()

    if (shouldWait) {
        return
    }
    setTimeout(function() {
        onWitchTurnFinished()
    }, 5000)
}

function performHunterAction(msg) {
    console.log("performHunterAction():", msg)

    if (msg.content == "1") {
        hunterChosenIndex = 0
    } else if (msg.content == "2") {
        hunterChosenIndex = 1
    } else if (msg.content == "3") {
        hunterChosenIndex = 2
    } else {
        hunterChosenIndex = -1
    }

    if (hunterChosenIndex == -1) {
        msg.channel.send("Não entendi. Digite `1`, `2` ou `3` para escolher uma carta do cemitério")
        return
    }

    msg.channel.send("GG. Vou continuar lá no server o jogo")
    onHunterTurnFinished()
}


function beginWitchTurn(asZombie) {
    if (!asZombie) {
        serverChannel.send("Acorde Bruxa! Preveja o futuro de alguém...")
    }

    if (!isCardWithPlayer(CardWitch)) {
        // Witch não está com nenhum jogador
        return false
    }

    currentTurn = CardWitch

    var playerCard

    if (asZombie) {
        playerCard = playerCards[CardZombie.id]
    } else {
        playerCard = playerCards[CardWitch.id]
    }

    const player = playerCard.player

    var menu = ""
    var index = 1
    forEachPlayer(player => {
        if (menu == "") {
            menu = "`" + index + "` - " + player.name
        } else {
            menu = menu + "\n`" + index + "` - " + player.name
        }

        index++
    })

    const playerChannel = bot.users.cache.get(player.id)

    if (!asZombie) {
        playerChannel.send("Acorde Bruxa! Preveja o futuro de alguém...")
    }

    playerChannel.send("Escolha um jogador para ver a carta digitando o número correspondente:\n\n**Opções**:\n" + menu)

    return true
}

function onWitchTurnFinished() {   
    if (pendingZombieNewActionExecution) {
        finishZombieAction()
    }
    
    if (containsTwoWerewolfs) {
        beginWerewolfsTurn()
    } else {
        beginSoloWerewolfTurn()
    }

    onWerewolfTurnFinished()
}

function performWitchAction(msg) {
    console.log("performWitchAction():", msg)
    const index = parseInt(msg.content)

    if (index == NaN || index < 0 || index > playerCount - 1) {
        var menu = ""
        var i = 1
        forEachPlayer(player => {
            if (menu == "") {
                menu = "`" + i + "` - " + player.name
            } else {
                menu = menu + "\n`" + i + "` - " + player.name
            }
            i++
        })

        msg.channel.send("Escolha um jogador para ver a carta digitando o número correspondente:\n\n**Opções**:\n" + menu)
        return
    }

    const playerIndex = index - 1
    const chosenPlayer = players[playerIndex]

    forEachPlayerCard(playerCard => {
        if (playerCard.player.id == chosenPlayer.id) {
            const card = playerCard.deckCard.card
            msg.channel.send("A carta do " + chosenPlayer.name + " é: " + card.name)
        }
    })

    msg.channel.send("GG. Vou continuar lá no server o jogo")
    onWitchTurnFinished()
}


function beginWerewolfsTurn() {
    serverChannel.send("Acorde Lobisomem! Forme sua alcatéia...")

    if (!isCardWithPlayer(CardWerewolf)) {
        // Werewolf não está com nenhum jogador
        return false
    }

    currentTurn = CardWerewolf

    var playerCardA, playerCardB;

    forEachPlayerCard(playerCard => {
        if (playerCard.deckCard.card == CardWerewolf) {
            if (playerCardA == undefined) {
                playerCardA = playerCard

            } else if (playerCardB == undefined) {
                playerCardB = playerCard
            }
        }
    })

    beginWerewolfTurn(playerCardA, playerCardB.player)
    beginWerewolfTurn(playerCardB, playerCardA.player)

    return false
}

function beginSoloWerewolfTurn() {
    serverChannel.send("Acorde Lobisomem! Forme sua alcatéia...")

    if (!isCardWithPlayer(CardWerewolf)) {
        // Werewolf não está com nenhum jogador
        return false
    }

    currentTurn = CardWerewolf

    const playerCard = playerCards[CardWerewolf.id]
    const player = playerCard.player

    var cemiteryCards = ""

    for (index in cemitery) {
        if (index == hunterChosenIndex) {
            continue
        }

        if (cemiteryCards == "") {
            cemiteryCards = cemitery[index].card.name
        } else {
            cemiteryCards += ", " + cemitery[index].card.name
        }
    }

    const playerChannel = bot.users.cache.get(player.id)
    playerChannel.send("Acorde Lobisomem! Forme sua alcatéia...")
    playerChannel.send("Cartas do cemitério: " + cemiteryCards)

    return false
}

function beginWerewolfTurn(playerCard, otherPlayer) {
    const player = playerCard.player

    var menu = ""
    var index = 1
    forEachPlayer(player => {
        if (menu == "") {
            menu = "`" + index + "` - " + player.name
        } else {
            menu = menu + "\n`" + index + "` - " + player.name
        }
        index++
    })

    const playerChannel = bot.users.cache.get(player.id)
    playerChannel.send("Acorde Lobisomem! Forme sua alcatéia...")
    playerChannel.send("Seu parceiro é " + otherPlayer.name)
}

function onWerewolfTurnFinished() {    
    const shouldWait = beginZombieTurn()
    if (shouldWait) {
        return
    }

    setTimeout(function() {
        onZombieTurnFinished()
    }, 5000);
}


function beginZombieTurn() {
    serverChannel.send("Zumbi, levanta-te e escolha um corpo do cemitério...")

    if (!isCardWithPlayer(CardZombie)) {
        // Zombie não está com nenhum jogador
        return false
    }

    currentTurn = CardZombie

    const playerCard = playerCards[CardZombie.id]
    const player = playerCard.player

    const playerChannel = bot.users.cache.get(player.id)
    playerChannel.send("Zumbi, levanta-te e escolha um corpo do cemitério...")

    if (hunterChosenIndex == -1) {
        playerChannel.send("Escolha uma carta do cemitério digitando `1` ou `2`")
    } else {
        playerChannel.send("Escolha uma carta do cemitério digitando `1`, `2` ou `3`")
    }

    return true
}

function finishZombieAction() {
    pendingZombieNewActionExecution = false
    onZombieTurnFinished()
}

function onZombieTurnFinished() {    
    const zombieNewCard = cemitery[zombieChosenIndex]

    if (zombieNewCard != CardVampire) {
        const shouldWait = beginVampireTurn()

        if (shouldWait) {
            return
        }

        setTimeout(function() {
            onVampireTurnFinished()
        }, 5000)
    } else {
        performDayRound()
    }
}

function performZombieAction(msg) {
    console.log("performZombieAction():", msg)

    const n = parseInt(msg.content)

    if (n == NaN) {
        if (hunterChosenIndex == -1) {
            playerChannel.send("Não entendi. Escolha uma carta do cemitério digitando `1` ou `2`")
        } else {
            playerChannel.send("Não entendi. Escolha uma carta do cemitério digitando `1`, `2` ou `3`")
        }
        return
    }

    const chosenNumber = n - 1
    if (hunterChosenIndex != -1 && hunterChosenIndex <= chosenNumber) {
        zombieChosenIndex = chosenNumber + 1
    } else {
        zombieChosenIndex = chosenNumber
    }

    const zombieNewCard = cemitery[zombieChosenIndex]
    const cardMessage = new MessageEmbed()
        .setTitle("Sua nova carta é " + zombieNewCard.card.name)
        .setDescription(zombieNewCard.card.description)
        .setColor(0xff0000)

    msg.channel.send(cardMessage)

    if (zombieNewCard.card.round == 0 || (zombieNewCard.card == CardWerewolf && containsTwoWerewolfs)) {
        finishZombieAction(msg.channel)
    } else {
        pendingZombieNewActionExecution = true
        msg.channel.send("Deseja executar a ação dessa carta? Digite `S` para Sim ou `N` para Não.")
    }
}

function performZombieNewCardAction(msg) {
    console.log("performZombieNewCardAction():", msg)

    if (msg.content == "Não" || msg.content == "Nao" || msg.content == "não" || msg.content == "nao" || msg.content == "N" || msg.content == "n") {
        finishZombieAction(msg.channel)
        return
    }

    if (msg.content != "Sim" && msg.content != "sim" && msg.content != "S" && msg.content != "S") {
        playerChannel.send("Não entendi. Deseja executar a ação dessa carta? Digite `S` para Sim ou `N` para Não.")
        return
    }

    const zombieNewCard = cemitery[zombieNewCard]
    switch(zombieNewCard.card) {
        case CardHunter:
            beginHunterTurn(true)
            break;
        case CardWitch:
            beginWitchTurn(true)
            break;
        case CardVampire:
            beginVampireTurn(true)
            break;
    }

}


function beginVampireTurn(asZombie) {
    if (!asZombie) {
        serverChannel.send("Acorde vampiro! Sugue o sangue de uma vítima...")
    }

    if (!isCardWithPlayer(CardVampire)) {
        // Vampire não está com nenhum jogador
        return false
    }

    currentTurn = CardVampire

    var playerCard
    if (asZombie) {
        playerCard = playerCards[CardZombie.id]
    } else {
        playerCard = playerCards[CardVampire.id]
    }

    const player = playerCard.player
    const playerChannel = bot.users.cache.get(player.id)

    if (!asZombie) {
        playerChannel.send("Acorde vampiro! Sugue o sangue de uma vítima...")
    }

    var menu = ""
    var index = 1
    forEachPlayer(player => {
        if (menu == "") {
            menu = "`P" + index + "` - " + player.name
        } else {
            menu = "\n`P" + index + "` - " + player.name
        }

        index++
    })

    if (hunterChosenIndex != -1) {
        if (zombieChosenIndex != -1) {
            playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou escolha uma carta de outro jogador digitando:\n" + menu)
        } else {
            playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" + menu)
        }
    } else {
        if (zombieChosenIndex != -1) {
            playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" + menu)
        } else {
            playerChannel.send("Escolha uma carta do cemitério digitando `C1`, `C2` ou `C3` ou escolha uma carta de outro jogador digitando:\n" + menu)
        }
    }

    return true
}

function onVampireTurnFinished() {
    if (pendingZombieNewActionExecution) {
        finishZombieAction()
        return
    }

    performDayRound()
}

function performVampireAction(msg) {
    console.log("performVampireAction():", msg)

    var chosenCemitery = -1
    var chosenPlayer = -1

    if (msg.content == "C1") {
        chosenCemitery = 0
    } else if (msg.content == "C2") {
        chosenCemitery = 1
    } else if (msg.content == "C3") {
        chosenCemitery = 2
    } else if (msg.content == "P1") {
        chosenPlayer = 0
    } else if (msg.content == "P2") {
        chosenPlayer = 1
    } else if (msg.content == "P3") {
        chosenPlayer = 2
    } else if (msg.content == "P4") {
        chosenPlayer = 3
    } else if (msg.content == "P5") {
        chosenPlayer = 4
    } else if (msg.content == "P6") {
        chosenPlayer = 5
    } else if (msg.content == "P7") {
        chosenPlayer = 6
    } else {
        if (hunterChosenIndex != -1) {
            if (zombieChosenIndex != -1) {
                playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou escolha uma carta de outro jogador digitando:\n" + menu)
            } else {
                playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" + menu)
            }
        } else {
            if (zombieChosenIndex != -1) {
                playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" + menu)
            } else {
                playerChannel.send("Escolha uma carta do cemitério digitando `C1`, `C2` ou `C3` ou escolha uma carta de outro jogador digitando:\n" + menu)
            }
        }
        return
    }

    if (chosenCemitery != -1) {
        var aux

        if (hunterChosenIndex != -1 && hunterChosenIndex <= chosenCemitery) {
            aux = chosenCemitery + 1
        } else {
            aux = chosenCemitery
        }

        if (zombieChosenIndex != -1 && zombieChosenIndex <= chosenCemitery) {
            aux = chosenCemitery + 1
        } else {
            aux = chosenCemitery
        }

        if (hunterChosenIndex == aux || zombieChosenIndex == aux) {
            if (hunterChosenIndex != -1) {
                if (zombieChosenIndex != -1) {
                    playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou escolha uma carta de outro jogador digitando:\n" + menu)
                } else {
                    playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" + menu)
                }
            } else {
                if (zombieChosenIndex != -1) {
                    playerChannel.send("Escolha uma carta do cemitério digitando `C1` ou `C2` ou escolha uma carta de outro jogador digitando:\n" + menu)
                } else {
                    playerChannel.send("Escolha uma carta do cemitério digitando `C1`, `C2` ou `C3` ou escolha uma carta de outro jogador digitando:\n" + menu)
                }
            }
            return
        } else {
            vampireChosenCemiteryIndex = aux
        }

        const vampireNewCard = cemitery[vampireChosenCemiteryIndex]
        const cardMessage = new MessageEmbed()
            .setTitle("Sua nova carta é " + vampireNewCard.card.name)
            .setDescription(vampireNewCard.card.description)
            .setColor(0xff0000)

        msg.channel.send(cardMessage)

        onVampireTurnFinished()
        return
    }

    if (chosenPlayer != -1) {
        vampireChosenPlayerIndex = chosenPlayer - 1
        const vampireNewCard = cemitery[vampireChosenPlayerIndex]
        const cardMessage = new MessageEmbed()
            .setTitle("Sua nova carta é " + vampireNewCard.card.name)
            .setDescription(vampireNewCard.card.description)
            .setColor(0xff0000)

        msg.channel.send(cardMessage)

        onVampireTurnFinished()
        return
    }
}

// end Cards

var isGameOn = false
var dayNightTurn = null
var currentTurn = null
var serverChannel = false
var hunterChosenIndex = -1
var zombieChosenIndex = -1
var vampireChosenCemiteryIndex = -1
var vampireChosenPlayerIndex = -1
var pendingZombieNewActionExecution = false

function startGame(channel) {
    if (isGameOn) {
        msg.channel.send("O jogo já começou")
        return
    }

    const success = prepareDeck()

    if (success) {
        isGameOn = true
        serverChannel = channel
        serverChannel.send("O jogo está começando")
        serverChannel.send("Cartas no jogo:" + deckToString())
    } else {
        isGameOn = false
        serverChannel = null
        serverChannel.send("Número insuficiente de jogadores")
        return
    }

    dealCards()
    currentPlayerIndex = 0

    beginNightTurn()
}

function beginNightTurn() {
    dayNightTurn = "night"
    
    serverChannel.send("Anoiteceu")

    const shouldWaitHunter = beginHunterTurn()

    if (shouldWaitHunter) {
        return
    }

    onHunterTurnFinished()
}

function performDayRound() {
    serverChannel.send("Amanheceu")
    serverChannel.send("fim do jogo")
    isGameOn = false
}

