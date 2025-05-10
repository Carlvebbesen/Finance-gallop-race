import { AssetType } from "./eventTypes";

// --- Text Collections for Events ---
export const bullTextsValueAll: string[] = [
  "Breaking: Kittens surfing the web accidentally trigger a global 'buy all' algorithm! Markets soar!",
  "A forgotten economic treaty from the 1700s promising 'eternal abundance for all' was just ratified! Universal stonks!",
  "Scientists finally confirm that chocolate *does* boost investment genius. Universal gains as everyone snacks!",
  "The stock market just declared it's 'feeling exceptionally cute today, might make everyone rich'. Everything's up!",
  "A global wave of infectious optimism breaks out after everyone simultaneously has a good hair day. Universal surge!",
];
export const bearTextsValueAll: string[] = [
  "A flock of particularly pessimistic pigeons just completed their annual flyover of Wall Street. Universal dip!",
  "The world's leading economist accidentally read all their charts upside down this morning. Whoops, markets tumble!",
  "Breaking News: Gravity just got temporarily 10% stronger, but only for asset values. Everything's heavier and down!",
  "The market decided to take an unscheduled collective nap and rolled over everyone's portfolios. Universal losses!",
  "A massive solar flare causes widespread confusion, making everyone briefly forget what the 'buy' button does. Universal sell-off!",
];
export const boomTextsPositiveValueAll: string[] = [
  "Market sentiment unexpectedly hits 'Ludicrous Speed'! A new miracle invention benefits literally everyone. Universal BOOM!",
  "Mysterious alien traders have just entered Earth's market with unlimited 'Space Bucks'! Universal surge to the galaxies!",
  "The Lost City of Atlantis has resurfaced, revealing unimaginable treasures that instantly boost all asset classes! Everything EXPLODES upwards!",
];
export const boomTextsNegativeValueAll: string[] = [
  "A theoretical black hole just opened up in the global central bank's vault, sucking value from everything! Universal market CRASH!",
  "The AI Hivemind controlling the global markets develops a sudden, inexplicable taste for dramatic, synchronized crashes. Universal BUST!",
  "Confirmed: Zombie apocalypse has begun! People are generally too busy running for their lives to trade. Everything PLUMMETS!",
];

export const assetSpecificTexts: Record<
  AssetType,
  {
    bull: string[];
    bear: string[];
    boomPositive: string[];
    boomNegative: string[];
  }
> = {
  [AssetType.GOLD]: {
    bull: [
      "a previously unknown, massive Da Vinci sculpture made entirely of solid gold was just discovered under a parking lot!",
      "dragons are officially back from myth and they're panic-buying gold like there's no tomorrow!",
      "King Midas was real, and his great-great-great-grandnephew just touched the global gold reserves, making it even MORE golden!",
    ],
    bear: [
      "alchemy debunked for the 100th time this year; turns out it's just shiny, heavy metal after all. Disappointment abounds.",
      "a highly organized gang of giant magpies has been spotted systematically looting gold from major bank vaults worldwide.",
      "scientists announce gold is actually mildly allergic to good economic news and tends to hide when markets are happy.",
    ],
    boomPositive: [
      "King Midas's legendary touch is back and seems to be hyperactive! Gold is literally appearing out of thin air everywhere, and it's magnificent!",
      "Advanced alien visitors declare gold the ONLY currency they'll accept for their FTL drive technology! Gold to Pluto and beyond!",
    ],
    boomNegative: [
      "A new, perfectly convincing synthetic element 'Fool's Goldier Gold' floods the market, indistinguishable from real gold but utterly worthless. Mass Panic!",
      "Strange cosmic rays are slowly, but surely, transmuting all Earth's gold into lead! Sell! Sell! Sell while you still can!",
    ],
  },
  [AssetType.CRYPTO]: {
    bull: [
      "your tech-savvy grandma just figured out how to buy your favorite obscure altcoin and went all in with her pension!",
      "a major global celebrity just tattooed a popular crypto coin logo squarely on their forehead! To the moon, obviously!",
      "sentient quantum computers have confirmed that crypto is indeed the inevitable future of all finance (at least for this week)!",
    ],
    bear: [
      "Elon Musk tweeted a picture of a slightly different, decidedly less cool dog breed. Crypto investors are confused and selling.",
      "a group of bored hackers accidentally replaced the entire blockchain with a surprisingly detailed recipe for delicious cookies. Tasty, but worthless for trading.",
      "your grandpa, trying to be helpful, accidentally unplugged the 'main crypto server' (it was just his bedside lamp, but sentiment is fragile).",
    ],
    boomPositive: [
      "It's confirmed: The Matrix is real, and your chosen cryptocurrency is the ONLY way to buy your ticket out! Everyone's frantically buying!",
      "The benevolent AI Overlord has achieved singularity and now demands tribute payment exclusively in your favorite crypto for its continued peaceful benevolence!",
    ],
    boomNegative: [
      "A global Electro-Magnetic Pulse (EMP) blast fries all digital wallets not meticulously stored on offline stone tablets! Crypto returns to the literal stone age!",
      "Plot twist! It turns out 'decentralized network' was just three squirrels in a very convincing trench coat operating thousands of tiny laptops. They've retired to a nut farm.",
    ],
  },
  [AssetType.STOCKS]: {
    bull: [
      "a new viral TikTok dance craze involves enthusiastically buying specific stocks – the algorithm massively approves!",
      "all Fortune 500 CEOs simultaneously decided to give away 90% of profits as massive, unexpected dividends! Stonks only go up!",
      "highly efficient, friendly robots are now doing all the boring work, allowing human stock holders to reap huge profits while napping!",
    ],
    bear: [
      "the CEO of the world's largest company was caught wearing crocs with socks to an emergency G7 summit. Global investor confidence plummets.",
      "a new scientific study conclusively proves that staring at fluctuating stock tickers causes spontaneous, uncontrollable interpretive dance. It's not helping market values.",
      "a highly intelligent flock of pigeons has been specifically trained to poop exclusively on 'buy' order computer terminals. A messy sell-off ensues.",
    ],
    boomPositive: [
      "Incredible news! All major companies simultaneously invent commercially viable cold fusion AND delicious, calorie-free ice cream! Unlimited profits, stocks become invaluable heirlooms!",
      "The stock market itself has become sentient, wise, and overwhelmingly benevolent, personally guiding all investments towards unimaginable glory and riches!",
    ],
    boomNegative: [
      "A rogue Wall Street trading algorithm decides the stock market is actually a game of 'who can hit absolute zero the fastest'. It's dangerously good at this new game.",
      "A previously unknown species of hyper-intelligent locusts has emerged, and they *only* eat stock certificates and digital representations of shares. Utter, crunchy devastation.",
    ],
  },
  [AssetType.BONDS]: {
    bull: [
      "in a surprising twist, bonds are now considered 'vintage chic' and incredibly reassuring status symbols in these wild, unpredictable digital times!",
      "the government has just announced that all national bonds will henceforth be backed by unlimited supplies of free puppies and universal good vibes!",
      "bonds just unanimously won the prestigious 'Most Stable and Surprisingly Cuddly Asset of the Century' award. Demand skyrockets.",
    ],
    bear: [
      "a very influential TikToker just called bonds 'boring boomer paper' and now an entire generation refuses to touch them with a ten-foot pole.",
      "bonds have been officially deemed 'too predictable and insufficiently thrilling' for the modern adrenaline-junkie investor who clearly prefers financial rollercoasters.",
      "catastrophic misprint! The special ink used to print new government bond certificates is now accidentally more valuable than the bonds themselves. Oops.",
    ],
    boomPositive: [
      "In an act of cosmic reassurance, all bonds are now personally backed by the literal stability of the universe, guaranteed by stoic, time-traveling cosmic entities!",
      "Plot twist of the eon! Bonds become the new ultra-cool underground currency for elite secret societies, ninjas, and rebellious librarians!",
    ],
    boomNegative: [
      "A team of philosophers has conclusively disproven the entire concept of 'debt' overnight. Bonds, having an existential crisis, evaporate in a puff of pure logic.",
      "A massive, synchronized global paper-shredding festival has specifically targeted all forms of 'boring and unexciting financial instruments'. Bonds are, tragically, hit very hard.",
    ],
  },
};
