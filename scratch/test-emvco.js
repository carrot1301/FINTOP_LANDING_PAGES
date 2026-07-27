// Test EMVCo VietQR data generation
function crc16ccitt(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            crc &= 0xFFFF;
        }
    }
    return crc;
}

function buildVietQRData(bankBin, account, amount, addInfo) {
    function tlv(tag, value) {
        return tag + String(value.length).padStart(2, '0') + value;
    }
    let payload = '';
    payload += tlv('00', '01');
    payload += tlv('01', '12');
    let merchantAcct = '';
    merchantAcct += tlv('00', 'A000000727');
    let consumerInfo = '';
    consumerInfo += tlv('00', bankBin);
    consumerInfo += tlv('01', account);
    merchantAcct += tlv('01', consumerInfo);
    merchantAcct += tlv('02', 'QRIBFTTA');
    payload += tlv('38', merchantAcct);
    payload += tlv('53', '704');
    if (amount && amount > 0) {
        payload += tlv('54', String(amount));
    }
    payload += tlv('58', 'VN');
    if (addInfo) {
        let field62 = tlv('08', addInfo);
        payload += tlv('62', field62);
    }
    payload += '6304';
    const crc = crc16ccitt(payload);
    payload += crc.toString(16).toUpperCase().padStart(4, '0');
    return payload;
}

// Test cases
const test1 = buildVietQRData('970422', '862862348886', 2500000, 'FINTOP PRO1');
console.log('=== Test 1: PRO1 2.5M ===');
console.log(test1);

const test2 = buildVietQRData('970422', '862862348886', 4500000, 'NGUYEN VAN TUAN 0862348886 PRO2');
console.log('\n=== Test 2: PRO2 4.5M with user info ===');
console.log('Data:', test2);
console.log('Length:', test2.length);

// Verify structure by parsing TLV
function parseTLV(data) {
    let pos = 0;
    while (pos < data.length) {
        const tag = data.substring(pos, pos + 2);
        const len = parseInt(data.substring(pos + 2, pos + 4), 10);
        const val = data.substring(pos + 4, pos + 4 + len);
        console.log(`  Tag ${tag} (len=${len}): "${val}"`);
        pos += 4 + len;
    }
}

console.log('\n=== Parsed TLV structure ===');
parseTLV(test1);
