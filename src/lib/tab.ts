type TabResult = {
  value: string,
  start: number,
  end: number
}

function isMultiLineSelection(start: number, end: number, input: string): boolean {
  return start < end && /.*\n.*./.test(input.substring(start, end));
}

function multiLineTab(start: number, end: number, input: string, addTabs: boolean): TabResult {
  let lineStart = start;
  let lineEnd = end;
  let lines = input.split('\n');
  lines = lines.map((s, i) => i < lines.length - 1 ? s + '\n' : s);  
  let firstLine = 0;
  let lineLen;
  while (lineStart > (lineLen = lines[firstLine].length) - 1) {
    lineStart -= lineLen;
    lineEnd -= lineLen;
    firstLine++;
  }
  let lastLine = firstLine;
  while (lineEnd > (lineLen = lines[lastLine].length)) {
    lineEnd -= lineLen;
    lastLine++;
  }
  if (addTabs) {
    for (let i = firstLine; i < lastLine + 1; i++) {
      lines[i] = '\t' + lines[i];
    }
    return {
      value: lines.join(''),
      start: start + 1,
      end: end + lastLine - firstLine + 1
    };
  } else {
    let shiftedFirst = false;
    let count = 0;
    for (let i = firstLine; i < lastLine + 1; i++) {
      if (lines[i].startsWith('\t')) {
        lines[i] = lines[i].substring(1);
        shiftedFirst = shiftedFirst || i === firstLine;
        count++;
      }
    }
    return {
      value: lines.join(''),
      start: start - (shiftedFirst ? 1 : 0),
      end: end - count
    };
  }
}

function insertTab(start: number, end: number, input: string): TabResult {
  return {
    value: input.substring(0, start) + '\t' + input.substring(start), 
    start: start + 1,
    end: end + 1
  };
}

function removeTab(start: number, end: number, input: string): TabResult {
  let substr = input.substring(0, start); 
  if (substr.endsWith('\t')) {
    return {
      value: substr.substring(0, substr.length - 1) + input.substring(start),
      start: Math.max(0, start - 1),
      end: end - 1
    };
  } else {
    return {
      value: input,
      start,
      end
    };
  }
}

export function handleTabPressEvent($event: any, control: any) {
  if ($event.key === 'Tab') {
    $event.preventDefault();
    let input = $event.target.value;
    let start = $event.target.selectionStart;
    let end = $event.target.selectionEnd;
    let result: TabResult;
    if ($event.shiftKey) {
      if (isMultiLineSelection(start, end, input)) {
        result = multiLineTab(start, end, input, false);
      } else {
        result = removeTab(start, end, input);
      }
    } else {
      if (isMultiLineSelection(start, end, input)) {
        result = multiLineTab(start, end, input, true);
      } else {
        result = insertTab(start, end, input);
      }
    }
    control.reset(result.value);
    $event.target.selectionStart = result.start;
    $event.target.selectionEnd = result.end;
  }
}