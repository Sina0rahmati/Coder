let token = '';

function encodeText(text) {
  let numbers = [...text.toUpperCase()].map(ch => {
    let n = ch.charCodeAt(0) - 64;
    if (n >= 1 && n <= 26) return n + 8;
    return '';
  });
  let coded = numbers.join('0') + '';
  let result = (parseInt(coded.replace(/0/g, '')) + 888).toString();
  return result;
}

async function register() {
  let r = await fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user.value, password: pass.value })
  });
  alert((await r.json()).message || 'خطا');
}

async function login() {
  let r = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user.value, password: pass.value })
  });
  let d = await r.json();
  token = d.token;
  alert(token ? 'ورود موفق' : d.error);
}

async function send() {
  let raw = message.value;
  let encoded = encodeText(raw);
  encodedEl.innerText = 'رمزنگاری: ' + encoded;
  await fetch('http://localhost:5000/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, receiver: receiver.value, encryptedText: encoded })
  });
}
