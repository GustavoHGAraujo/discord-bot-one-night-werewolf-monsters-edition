const CardWerewolf = {
    id: "werewolf",
    name: "Lobisomem",
    round: 3,
    description:
        "Sobreviva  mat os aldeões. Voce pode ver as cartas do cemitério",
};

const CardVampire = {
    id: "vampire",
    name: "Vampiro",
    round: 5,
    description:
        "Pod trocar esta carta por uma de outro jogador ou do cemitério. (Caso pgue a carta de Zumbi, utilize a habilidade)",
};

const CardHunter = {
    id: "hunter",
    name: "Caçador",
    round: 1,
    description:
        "Esconda, sem olhar, uma carta do cemitério. Se o Caçador sobreviver e a carta for um Lobisomem, os Aldeões vencem.",
};

const CardWitch = {
    id: "witch",
    name: "Bruxa",
    round: 2,
    description: "Pode ver a carta de outro jogador",
};

const CardMummy = {
    id: "mummy",
    name: "Múmia",
    round: 0,
    description: "Faça com que você seja o escolhido para morrer.",
};

const CardSkeleton = {
    id: "skeleton",
    name: "Esqueleto",
    round: 0,
    description: "Faça com que você seja o escolhido para morrer.",
};

const CardVillager = {
    id: "villager",
    name: "Aldeão",
    round: 0,
    description: "Tente sobreviver... Cuidado com os Lobisomens!",
};

const CardZombie = {
    id: "zombie",
    name: "Zumbi",
    round: 4,
    description:
        "Esconda esta carta. Pegue uma carta do cemitério e caso deseje, utilize a habilidade.",
};

module.exports = {
    CardHunter,
    CardMummy,
    CardSkeleton,
    CardVampire,
    CardVillager,
    CardWerewolf,
    CardWitch,
    CardZombie,
};
