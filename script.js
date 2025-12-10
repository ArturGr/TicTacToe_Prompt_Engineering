let fields = [
  null, null, null,
  null, null, null,
  null, null, null,
];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
  [0, 4, 8], [2, 4, 6], // diagonal
];

let currentPlayer = 'circle';

function init() {
  render();
}

function render() {
  const contentDiv = document.getElementById('content');

  // Generate table HTML
  let tableHtml = '<table>';
  for (let i = 0; i < 3; i++) {
    tableHtml += '<tr>';
    for (let j = 0; j < 3; j++) {
      const index = i * 3 + j;
      let symbol = '';
      if (fields[index] === 'circle') {
        symbol = generateCircleSVG();
      } else if (fields[index] === 'cross') {
        symbol = generateCrossSVG();
      }
      tableHtml += `<td onclick="handleClick(this, ${index})">${symbol}</td>`;
    }
    tableHtml += '</tr>';
  }
  tableHtml += '</table>';

  // Set table HTML to contentDiv
  contentDiv.innerHTML = tableHtml;
}

function restartGame() {
  fields = new Array(9).fill(null);
  currentPlayer = 'circle';
  // render() will set new onclick in cells
  render();
}

function handleClick(cell, index) {
  // ignore clicks if game over
  if (getWinningCombination() !== null) return;
  if (fields[index] !== null) return;

  fields[index] = currentPlayer;
  cell.innerHTML = currentPlayer === 'circle' ? generateCircleSVG() : generateCrossSVG();
  cell.onclick = null;

  const winCombination = getWinningCombination();
  if (winCombination) {
    drawWinningLine(winCombination);
    disableBoard();
    showOverlay(currentPlayer === 'circle' ? "⭕ Kreis gewinnt!" : "✖️ Kreuz gewinnt!");
    return;
  }

  if (fields.every(f => f !== null)) {
    disableBoard();
    showOverlay("🤝 Unentschieden!");
    return;
  }

  currentPlayer = currentPlayer === 'circle' ? 'cross' : 'circle';
}

function isGameFinished() {
  return fields.every((field) => field !== null) || getWinningCombination() !== null;
}

function getWinningCombination() {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const [a, b, c] = WINNING_COMBINATIONS[i];
    if (fields[a] === fields[b] && fields[b] === fields[c] && fields[a] !== null) {
      return WINNING_COMBINATIONS[i];
    }
  }
  return null;
}

function disableBoard() {
  document.querySelectorAll('td').forEach(td => {
    td.onclick = null;
    // optional: add a class to visually block the interaction
    // td.classList.add('disabled');
  });
}

function generateCircleSVG() {
  const color = '#00B0EF';

  return `
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <circle cx="50" cy="50" r="40" stroke="${color}" stroke-width="8" fill="none">
        <animate attributeName="stroke-dasharray" from="0 251" to="251 0" dur="0.2s" fill="freeze" />
      </circle>
    </svg>
  `;
}

function generateCrossSVG() {
  const color = '#FFC000';

  return `
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <line x1="20" y1="20" x2="80" y2="80" stroke="${color}" stroke-width="10">
        <animate attributeName="x2" values="20; 80" dur="200ms" />
        <animate attributeName="y2" values="20; 80" dur="200ms" />
      </line>
      <line x1="80" y1="20" x2="20" y2="80" stroke="${color}" stroke-width="10">
        <animate attributeName="x2" values="80; 20" dur="200ms" />
        <animate attributeName="y2" values="20; 80" dur="200ms" />
      </line>
    </svg>
  `;
}

function drawWinningLine(combination) {
  if (!combination) return; // security - do nothing when null

  const lineColor = '#ffffff';
  const lineWidth = 5;

  const startCell = document.querySelectorAll(`td`)[combination[0]];
  const endCell = document.querySelectorAll(`td`)[combination[2]];
  const startRect = startCell.getBoundingClientRect();
  const endRect = endCell.getBoundingClientRect();

  const contentRect = document.getElementById('content').getBoundingClientRect();

  const lineLength = Math.sqrt(
    Math.pow(endRect.left - startRect.left, 2) + Math.pow(endRect.top - startRect.top, 2)
  );
  const lineAngle = Math.atan2(endRect.top - startRect.top, endRect.left - startRect.left);

  const line = document.createElement('div');
  line.style.position = 'absolute';
  line.style.width = `${lineLength}px`;
  line.style.height = `${lineWidth}px`;
  line.style.backgroundColor = lineColor;
  line.style.top = `${startRect.top + startRect.height / 2 - lineWidth / 2 - contentRect.top}px`;
  line.style.left = `${startRect.left + startRect.width / 2 - contentRect.left}px`;
  line.style.transform = `rotate(${lineAngle}rad)`;
  line.style.transformOrigin = `top left`;
  document.getElementById('content').appendChild(line);
}

function showOverlay(message) {
  document.getElementById('overlay-message').innerText = message;
  document.getElementById('overlay').classList.remove('hidden');
}

function closeOverlay() {
  document.getElementById('overlay').classList.add('hidden');
  restartGame();
}