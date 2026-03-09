import { createWidget, widget, prop } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { KEYBOARD_ACTION, Keyboard } from '@zos/keyboard'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()
let keyboardWidget = null;
let isSymbolsMode = false;
let keysAlpha = [];
let keysSymbols = [];

function generateKeyAttrs(rows, keyWidth, keyHeight, spacingX, spacingY, startY) {
    let keyAttrs = [];

    rows.forEach((row, rowIndex) => {
        // Calculate total width of this row
        let rowWidth = 0;
        row.forEach(keyText => {
            let actualWidth = keyWidth;
            if (keyText === 'Space') actualWidth = keyWidth * 3.5;
            else if (['Del', 'Enter', '.?123', 'א-ת'].includes(keyText)) {
                actualWidth = keyWidth * 2;
            }
            rowWidth += actualWidth;
        });
        rowWidth += (row.length - 1) * spacingX;

        let currentX = (DEVICE_WIDTH - rowWidth) / 2;
        const currentY = startY + rowIndex * (keyHeight + spacingY);

        row.forEach((keyText, colIndex) => {
            let actualWidth = keyWidth;
            let id = keyText;
            let displayedText = keyText;

            if (keyText === 'Space') {
                actualWidth = keyWidth * 3.5;
                id = 'SPACE';
                displayedText = 'רווח';
            } else if (keyText === 'Del') {
                actualWidth = keyWidth * 2;
                id = 'DELETE';
                displayedText = 'מחק';
            } else if (keyText === 'Enter') {
                actualWidth = keyWidth * 2;
                id = 'ENTER';
                displayedText = '↵';
            } else if (keyText === '.?123' || keyText === 'א-ת') {
                actualWidth = keyWidth * 2;
                id = 'TOGGLE_MODE';
            }

            keyAttrs.push({
                id: id,
                x: currentX,
                y: currentY,
                w: actualWidth,
                h: keyHeight,
                text: displayedText,
                text_size: 24,
                color: 0xffffff,
                bg_color: 0x333333,
                radius: 8
            });

            currentX += actualWidth + spacingX;
        });
    });

    return keyAttrs;
}

function initKeyboards() {
    const keyWidth = 42;
    const keyHeight = 60;
    const spacingX = 4;
    const spacingY = 8;
    const startY = 120;

    const rowsAlpha = [
        ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
        ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
        ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ'],
        ['.?123', 'Space', 'Del', 'Enter']
    ];

    const rowsSymbols = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
        ['-', '_', '=', '+', '[', ']', '{', '}', ';', ':'],
        ['א-ת', '\'', '"', ',', '.', '/', '?', 'Del', 'Enter']
    ];

    keysAlpha = generateKeyAttrs(rowsAlpha, keyWidth, keyHeight, spacingX, spacingY, startY);
    keysSymbols = generateKeyAttrs(rowsSymbols, keyWidth, keyHeight, spacingX, spacingY, startY);
}

function renderKeyboard() {
    const activeKeys = isSymbolsMode ? keysSymbols : keysAlpha;

    if (keyboardWidget) {
        keyboardWidget.setProperty(prop.MORE, {
            key_attr: activeKeys
        })
        return;
    }

    keyboardWidget = createWidget(widget.KEYBOARD, {
        x: 0,
        y: 0,
        w: DEVICE_WIDTH,
        h: DEVICE_HEIGHT,
        key_attr: activeKeys,
        click_func: (keyboard, key_id) => {
            let kb = null;
            try {
                kb = new Keyboard()
            } catch (e) {
                console.log('Keyboard API not available')
            }

            switch (key_id) {
                case 'TOGGLE_MODE':
                    isSymbolsMode = !isSymbolsMode;
                    renderKeyboard();
                    break;
                case 'DELETE':
                    if (kb) kb.triggerAction({ action: KEYBOARD_ACTION.BACKSPACE })
                    break;
                case 'ENTER':
                    if (kb) kb.triggerAction({ action: KEYBOARD_ACTION.ENTER })
                    break;
                case 'SPACE':
                    if (kb) kb.triggerAction({ action: KEYBOARD_ACTION.CHAR, value: ' ' })
                    break;
                default:
                    if (kb) kb.triggerAction({ action: KEYBOARD_ACTION.CHAR, value: key_id })
                    break;
            }
        }
    })
}

Page({
    onInit() {
        initKeyboards()
    },

    build() {
        renderKeyboard()
    }
})
