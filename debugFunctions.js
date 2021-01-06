const showCache = (cache) => {
    console.log(cache);
};

const listPlayers = (players) => {
    console.log(players);
    msg.channel.send(JSON.stringify(players));
};

const varsCemitery = (channel, cemitery) => {
    console.log("cemitery:", cemitery);
    channel.send(
        JSON.stringify({
            cemitery: cemitery,
        })
    );
};

const varsCurrentTurn = (channel, currentTurn) => {
    console.log("currentTurn:", currentTurn);
    channel.send(
        JSON.stringify({
            currentTurn: currentTurn,
        })
    );
};

const varsDayNightTurn = (channel, dayNightTurn) => {
    console.log("dayNightTurn:", dayNightTurn);
    channel.send(
        JSON.stringify({
            dayNightTurn: dayNightTurn,
        })
    );
};

const varsDeck = (channel, deck) => {
    console.log("deck:", deck);
    channel.send(
        JSON.stringify({
            deck: deck,
        })
    );
};

const varsIsGameOn = (channel, isGameOn) => {
    console.log("isGameOn:", isGameOn);
    channel.send(
        JSON.stringify({
            isGameOn: isGameOn,
        })
    );
};

const varsPlayers = (channel, players) => {
    console.log("players:", players);
    channel.send(
        JSON.stringify({
            players: players,
        })
    );
};

const varsPlayerCount = (channel, playerCount) => {
    console.log("playerCount:", playerCount);
    channel.send(
        JSON.stringify({
            playerCount: playerCount,
        })
    );
};

const varsPlayerCards = (channel, playerCards) => {
    console.log("playerCards:", playerCards);
    channel.send(
        JSON.stringify({
            playerCards: playerCards,
        })
    );
};

const varsHunterChosenIndex = (channel, hunterChosenIndex) => {
    console.log("hunterChosenIndex:", hunterChosenIndex);
    channel.send(
        JSON.stringify({
            hunterChosenIndex: hunterChosenIndex,
        })
    );
};

const varsZombieChosenIndex = (channel, zombieChosenIndex) => {
    console.log("zombieChosenIndex:", zombieChosenIndex);
    channel.send(
        JSON.stringify({
            zombieChosenIndex: zombieChosenIndex,
        })
    );
};

const varsVampireChosenIndex = (
    channel,
    vampireChosenCemiteryIndex,
    vampireChosenPlayerIndex
) => {
    console.log("vampireChosenCemiteryIndex:", vampireChosenCemiteryIndex);
    console.log("vampireChosenPlayerIndex:", vampireChosenPlayerIndex);
    channel.send(
        JSON.stringify({
            cemiteryIndex: vampireChosenCemiteryIndex,
            playerIndex: vampireChosenPlayerIndex,
        })
    );
};

const varsPendingZombieNewActionExecution = (
    channel,
    pendingZombieNewActionExecution
) => {
    console.log(
        "pendingZombieNewActionExecution:",
        pendingZombieNewActionExecution
    );
    channel.send(
        JSON.stringify({
            pendingZombieNewActionExecution: pendingZombieNewActionExecution,
        })
    );
};

const help = (channel) => {
    channel.send(
        "**Opções:**\n" +
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
    );
};

module.exports = {
    showCache,
    listPlayers,
    varsCemitery,
    varsCurrentTurn,
    varsDayNightTurn,
    varsDeck,
    varsIsGameOn,
    varsPlayers,
    varsPlayerCount,
    varsPlayerCards,
    varsHunterChosenIndex,
    varsZombieChosenIndex,
    varsVampireChosenIndex,
    varsPendingZombieNewActionExecution,
    help,
};
