/*
Text manipulation methods.
*/

const wide: Record<string, string> = {
  ' ': '　', '`': '`', '1': '１', '2': '２', '3': '３', '4': '４', '5': '５', '6': '６', '7': '７', '8': '８', '9': '９', '0': '０',
  '-': '－', '=': '＝', '~': '~', '!': '！', '@': '＠', '#': '＃', '$': '＄', '%': '％', '^': '^', '&': '＆', '*': '＊', '(': '（', ')': '）',
  '_': '_', '+': '＋', 'q': 'ｑ', 'w': 'ｗ', 'e': 'ｅ', 'r': 'ｒ', 't': 'ｔ', 'y': 'ｙ', 'u': 'ｕ', 'i': 'ｉ', 'o': 'ｏ', 'p': 'ｐ', '[': '[',
  ']': ']', '\\': '\\', 'Q': 'Ｑ', 'W': 'Ｗ', 'E': 'Ｅ', 'R': 'Ｒ', 'T': 'Ｔ', 'Y': 'Ｙ', 'U': 'Ｕ', 'I': 'Ｉ', 'O': 'Ｏ', 'P': 'Ｐ', '{': '{',
  '}': '}', '|': '|', 'a': 'ａ', 's': 'ｓ', 'd': 'ｄ', 'f': 'ｆ', 'g': 'ｇ', 'h': 'ｈ', 'j': 'ｊ', 'k': 'ｋ', 'l': 'ｌ', ';': '；', "'": '＇',
  'A': 'Ａ', 'S': 'Ｓ', 'D': 'Ｄ', 'F': 'Ｆ', 'G': 'Ｇ', 'H': 'Ｈ', 'J': 'Ｊ', 'K': 'Ｋ', 'L': 'Ｌ', ':': '：', 'z': 'ｚ', 'x': 'ｘ', 'c': 'ｃ',
  'v': 'ｖ', 'b': 'ｂ', 'n': 'ｎ', 'm': 'ｍ', ',': '，', '.': '．', '/': '／', 'Z': 'Ｚ', 'X': 'Ｘ', 'C': 'Ｃ', 'V': 'Ｖ', 'B': 'Ｂ', 'N': 'Ｎ',
  'M': 'Ｍ', '<': '<', '>': '>', '?': '？'
};

export type TransformState = 'aesthetic' | 'spaceship' | 'star' | 'valley' | 'mountain';

export function aesthetic(
  text: string,
  transform: TransformState,
  wide: boolean,
  rowChecked?: boolean,
  columnChecked?: boolean,
  diagonalChecked?: boolean
) {
  let trimmed = text.trim();
  if (transform === 'aesthetic') {
      if (rowChecked && columnChecked && diagonalChecked) {
        trimmed = diagonalRowColumn(trimmed);
      } else if (rowChecked && columnChecked) {
        trimmed = rowColumn(trimmed);
      } else if (rowChecked && diagonalChecked) {
        trimmed = diagonalRow(trimmed);
      } else if (columnChecked && diagonalChecked) {
        trimmed = diagonalColumn(trimmed, true);
      } else if (rowChecked) {
        trimmed = row(trimmed);
      } else if (columnChecked) {
        trimmed = column(trimmed);
      } else if (diagonalChecked) {
        trimmed = diagonal(trimmed, true)
      }
    } else if (transform === 'spaceship') {
      trimmed = spaceship(trimmed);
    } else if (transform === 'star') {
      trimmed = star(trimmed);
    } else if (transform === 'mountain') {
      trimmed = mountain(trimmed);
    } else if (transform === 'valley') {
      trimmed = valley(trimmed);
    } // else, no change
  
    if (wide) {
      trimmed = widen(trimmed);
    }
  
  return trimmed;
}


export function column(text: string): string {
  const chars = text.split('');

  return chars.join('\n');
}

export function row(text: string): string {
  const chars = text.split('');

  return chars.join(' ');
}

export function diagonal(text: string, printFirst: boolean): string {
  const chars = text.split('');
  let output = '';

  let i = printFirst ? 0 : 1;
  for (; i < chars.length; i++) {
    output += `${'  '.repeat(i)}${chars[i]}\n`;
  }
  return output.slice(0, -1);
}

export function rowColumn(text: string): string {
  let output = row(text);
  output += `\n${column(text.substring(1))}`;

  return output;
}

export function diagonalColumn(text: string, printFirst: boolean): string {
  if (text.length === 0) return '';

  const chars = text.split('');
  let output = printFirst ? `${chars[0]}\n` : '';

  for (let i = 1; i < chars.length; i++) {
    output += chars[i] + ' '.repeat(2 * i - 1) + chars[i] + '\n';
  }

  return output.slice(0, -1);
}

export function diagonalRow(text: string): string {
  let output = row(text) + '\n';
  output += diagonal(text, false);

  return output;
}

export function diagonalRowColumn(text: string): string {
  let output = row(text);
  output += `\n${diagonalColumn(text, false)}`;
  return output;
}

export function spaceship(text: string): string {
  return space(text, true);
}

export function star(text: string): string {
  return space(text, false);
}

function space(text: string, isSpaceship: boolean): string {
  const chars = text.split('');
  let output = '';
  const bottomHalf = [];

  if (isSpaceship) {
    for (let i = 0; i < chars.length; i++) {
      const currentLine = `${chars.join(' '.repeat(i))}\n`;
      output += currentLine;
      bottomHalf.push(currentLine);
    }

    output += `${chars.join(' '.repeat(text.length))}\n`;
  } else {
    for (let i = chars.length; i > 0; i--) {
      const currentLine = `${chars.join(' '.repeat(i))}\n`;
      output += currentLine;
      bottomHalf.push(currentLine);
    }

    output += `${text}\n`;
  }

  while (bottomHalf.length !== 0) {
    output += bottomHalf.pop();
  }

  return output.slice(0, -1);
}

export function mountain(text: string): string {
  return fade(text, false, text);
}

export function valley(text: string): string {
  return fade(text, true, text.substring(0, 1));
}

export function fade(text: string, startWithFullString: boolean, middleLine: string): string {
  let output = '';
  const bottomHalf = [];

  if (startWithFullString) {
    for (let i = text.length; i > 1; i--) {
      const currentLine = text.substring(0, i);
      if (!stringEndsWithSpace(currentLine)) {
        const withNewline = `${currentLine}\n`;
        output += withNewline;
        bottomHalf.push(withNewline);
      }
    }
  } else {
    for (let i = 1; i < text.length; i++) {
      const currentLine = text.substring(0, i);
      if (!stringEndsWithSpace(currentLine)) {
        const withNewline = `${currentLine}\n`;
        output += withNewline;
        bottomHalf.push(withNewline);
      }
    }
  }

  output += `${middleLine}\n`;

  while (bottomHalf.length !== 0) {
    output += bottomHalf.pop();
  }

  return output.slice(0, -1);
}

function stringEndsWithSpace(value: string) {
  return value.endsWith(' ');
}

export function widen(text: string) {
  const chars = text.split('');
  let output = '';

  for (const char of chars) {
    output += wide[char] ?? char;
  }

  return output;
}
