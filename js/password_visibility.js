const olho = document.getElementById('olho');
const senhaInput = document.getElementById('login-password');

olho.addEventListener('click', () => {
  if (senhaInput.type === 'password') {
    senhaInput.type = 'text';
  } else {
    senhaInput.type = 'password';
  }
});