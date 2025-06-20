const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const rankValues = {
  '2': 0, '3': 1, '4': 2, '5': 3, '6': 4, '7': 5,
  '8': 6, '9': 7, '10': 8, 'J': 9, 'Q': 10, 'K': 11, 'A': 12
};

const createDeck = () => {
  const deck = [];

  for (let i = 0; i < 52; i++) {
    const suitIndex = Math.floor(i / 13); // 0〜3
    const rankIndex = i % 13; // 0〜12

    deck.push({
      suit: suits[suitIndex],
      rank: ranks[rankIndex],
      value: rankValues[ranks[rankIndex]],
      image: `cards/torannpu-illust${i + 1}.png` // 連番画像
    });
  }

  return deck;
};

const shuffle = deck => [...deck].sort(() => Math.random() - 0.5);

const dealCards = deck => [deck.slice(0, 5), deck.slice(5, 10)];

const showHand = (hand, elementId) => {
  const container = document.getElementById(elementId);
  container.innerHTML = '';
  hand.forEach(card => {
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = `${card.rank} of ${card.suit}`;
    img.classList.add('card');
    container.appendChild(img);
  });
};

const evaluateHand = hand => {
  const values = hand.map(c => rankValues[c.rank]).sort((a, b) => b - a);
  const suitsSet = new Set(hand.map(c => c.suit));
  const rankCounts = hand.reduce((acc, c) => {
    acc[c.rank] = (acc[c.rank] || 0) + 1;
    return acc;
  }, {});

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = suitsSet.size === 1;
  const isRegularStraight = values.every((v, i, arr) => i === 0 || arr[i - 1] === v + 1);
  const isLowAceStraight = JSON.stringify(values) === JSON.stringify([12, 3, 2, 1, 0]);
  const isStraight = isRegularStraight || isLowAceStraight;

  const strength = isLowAceStraight ? [3, 2, 1, 0, -1] : values;

  if (isFlush && isStraight && values[0] === 12) return { role: 'ロイヤルフラッシュ', strength };
  if (isFlush && isStraight) return { role: 'ストレートフラッシュ', strength };
  if (counts[0] === 4) return { role: 'フォーカード', strength };
  if (counts[0] === 3 && counts[1] === 2) return { role: 'フルハウス', strength };
  if (isFlush) return { role: 'フラッシュ', strength };
  if (isStraight) return { role: 'ストレート', strength };
  if (counts[0] === 3) return { role: 'スリーオブアカインド', strength };
  if (counts[0] === 2 && counts[1] === 2) return { role: 'ツーペア', strength };
  if (counts[0] === 2) return { role: 'ワンペア', strength };
  return { role: 'ハイカード', strength };
};


const compareHands = (hand1, hand2) => {
  const handRanks = [
    'ハイカード', 'ワンペア', 'ツーペア', 'スリーオブアカインド', 'ストレート',
    'フラッシュ', 'フルハウス', 'フォーカード', 'ストレートフラッシュ', 'ロイヤルフラッシュ'
  ];

  const idx1 = handRanks.indexOf(hand1.role);
  const idx2 = handRanks.indexOf(hand2.role);

  if (idx1 > idx2) return '親の勝ち';
  if (idx1 < idx2) return '子の勝ち';

  // 同じ役 → 強さ比較（ハイカードなど）
  for (let i = 0; i < hand1.strength.length; i++) {
    if (hand1.strength[i] > hand2.strength[i]) return '親の勝ち';
    if (hand1.strength[i] < hand2.strength[i]) return '子の勝ち';
  }

  return '引分'; // 完全一致
};

document.getElementById('dealBtn').addEventListener('click', () => {
  const deck = shuffle(createDeck());
  const [dealer, player] = dealCards(deck);

  showHand(dealer, 'dealer-hand');
  showHand(player, 'player-hand');

  const dealerEval = evaluateHand(dealer);
  const playerEval = evaluateHand(player);

  document.getElementById('dealer-role').textContent = `役: ${dealerEval.role}`;
  document.getElementById('player-role').textContent = `役: ${playerEval.role}`;

  const result = compareHands(dealerEval, playerEval);

  const resultElements = document.querySelectorAll('.result');

   if (result === '親の勝ち') {
     resultElements[0].textContent = '勝ち';
     resultElements[1].textContent = '負け';
   } else if (result === '子の勝ち') {
     resultElements[0].textContent = '負け';
     resultElements[1].textContent = '勝ち';
   } else {
     resultElements[0].textContent = '引分';
     resultElements[1].textContent = '引分';
   }
});
