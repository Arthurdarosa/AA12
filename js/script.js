const contas = [];

// ========== FUNÇÕES DE TELA ==========
function mostrarApenasLogin(){
    document.getElementById("divHome").style.display = "none"
    document.getElementById("nova-conta").style.display = "none"
    document.getElementById("login-body").style.display = "block"
    loginEmailInput.value = ""
    loginPasswordInput.value = ""
    loginButton.disabled = true
}

function mostrarApenasConta(){
    document.getElementById("divHome").style.display = "none"
    document.getElementById("login-body").style.display = "none"
    document.getElementById("nova-conta").style.display = "block"
}

function mostrarApenasHome(){
    document.getElementById("divHome").style.display = "block"
    document.getElementById("login-body").style.display = "none"
    document.getElementById("nova-conta").style.display = "none"
}

// ========== LOGIN ==========
const loginEmailInput = document.querySelector('#login-body input[type="text"]');
const loginPasswordInput = document.querySelector('#login-password');
const loginButton = document.querySelector('#botaoLogin');

function validarCamposLogin() {
    if (loginEmailInput.value.trim() !== '' && loginPasswordInput.value.trim() !== '') {
        loginButton.disabled = false;
    } else {
        loginButton.disabled = true;
    }
}

function logar(){
    const email = loginEmailInput.value.trim();
    const senha = loginPasswordInput.value;

    const contaEncontrada = contas.find(conta => conta.email === email && conta.senha === senha);

    if (contaEncontrada) {
        alert(`Bem-vindo(a), ${contaEncontrada.nome}!`);
        mostrarApenasHome();
    } else {
        alert("Email ou senha incorretos!");
        loginPasswordInput.value = '';
        loginEmailInput.value = '';
    }
}

function validarEmailLogin() {
    const email = loginEmailInput.value.trim();
    const arrobas = (email.match(/@/g) || []).length;

    if (arrobas === 1) {
        alert("E-mail válido!");
    } else {
        alert("E-mail inválido.");
    }
}

const ufSelect = document.getElementById('uf-select');
const municipioSelect = document.getElementById('municipio-select');

function carregarUFs() {
  fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .then(res => res.json())
    .then(ufs => {
      // Ordenar por nome
      ufs.sort((a, b) => a.nome.localeCompare(b.nome));
      ufs.forEach(uf => {
        const option = document.createElement('option');
        option.value = uf.id;  // Usar ID para consulta de municípios
        option.textContent = uf.nome;
        ufSelect.appendChild(option);
      });
    })
    .catch(() => alert('Erro ao carregar UFs'));
}

function carregarMunicipios(ufId) {
  municipioSelect.innerHTML = '<option value="">Selecione um município</option>';
  municipioSelect.disabled = true;

  fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufId}/municipios`)
    .then(res => res.json())
    .then(municipios => {
      municipios.sort((a, b) => a.nome.localeCompare(b.nome));
      municipios.forEach(mun => {
        const option = document.createElement('option');
        option.value = mun.id;
        option.textContent = mun.nome;
        municipioSelect.appendChild(option);
      });
      municipioSelect.disabled = false;
    })
    .catch(() => alert('Erro ao carregar municípios'));
}

ufSelect.addEventListener('change', () => {
  const ufId = ufSelect.value;
  if (ufId) {
    carregarMunicipios(ufId);
  } else {
    municipioSelect.innerHTML = '<option value="">Selecione um município</option>';
    municipioSelect.disabled = true;
  }
});

// Executa ao carregar a página depois do login
carregarUFs();


loginButton.disabled = true;
loginEmailInput.addEventListener('input', validarCamposLogin);
loginPasswordInput.addEventListener('input', validarCamposLogin);
loginButton.addEventListener('click', validarEmailLogin);
loginButton.addEventListener('click', logar);


// ========== CLASSES ==========
class CPF {
    constructor(valor) {
        if (!CPF.validar(valor)) {
            throw new Error("CPF inválido: deve conter 11 dígitos numéricos e seguir a validação.");
        }
        this.valor = valor;
    }

    static validar(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
        let dig1 = (soma * 10) % 11;
        if (dig1 === 10) dig1 = 0;
        if (dig1 !== parseInt(cpf[9])) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
        let dig2 = (soma * 10) % 11;
        if (dig2 === 10) dig2 = 0;
        return dig2 === parseInt(cpf[10]);
    }
}

class Conta {
    constructor(nome, sobrenome, email, cpf, senha) {
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.email = email;
        this.cpf = cpf;
        this.senha = senha;
    }
}


// ========== CADASTRO ==========
window.onload = () => {
    const form = document.querySelector("#nova-conta form");
    const inputsTexto = form.querySelectorAll('input[type="text"]');
    const inputsSenha = form.querySelectorAll('input[type="password"]');
    const botaoCriarConta = document.querySelector('#areaBotaoConta input');

    // Indexação dos inputs (ajuste conforme sua ordem)
    const nomeInput = inputsTexto[0];
    const sobrenomeInput = inputsTexto[1];
    const cpfInput = inputsTexto[2];
    const emailCadastroInput = inputsTexto[3];
    const cepInput = document.getElementById('cep');
    const logradouroInput = document.getElementById('logradouro');
    const bairroInput = document.getElementById('bairro');
    const municipioInput = document.getElementById('municipio');
    const estadoInput = document.getElementById('estado');
    const senhaInput = inputsSenha[0];
    const repetirSenhaInput = inputsSenha[1];

    // Limpar campos e status ao iniciar
    [...inputsTexto, ...inputsSenha].forEach(campo => campo.value = '');
    document.querySelectorAll('p[id^="status"]').forEach(p => p.innerHTML = '');
    botaoCriarConta.disabled = true;

    // Controle do estado dos campos para habilitar botão
    const estadoCampos = {
        nome: false,
        sobrenome: false,
        cpf: false,
        email: false,
        senha: false,
        repetirSenha: false,

    };

    const checarBotao = () => {
        const tudoOk = Object.values(estadoCampos).every(v => v);
        botaoCriarConta.disabled = !tudoOk;
    };

    const sucesso = (idStatus) => {
        document.getElementById(idStatus).innerHTML = `<span style="color:green;">✅ Campo válido</span>`;
    };

    const erro = (idStatus, mensagem) => {
        document.getElementById(idStatus).innerHTML = `<span style="color:red;">❌ ${mensagem}</span>`;
    };

    // Validação texto em branco (nome, sobrenome, etc)
    window.validaTextoEmBranco = function(input, idStatus, campo) {
        const valor = input.value.trim();
        if (valor === '') {
            erro(idStatus, `${campo} não pode estar vazio.`);
            estadoCampos[campo.toLowerCase()] = false;
        } else {
            sucesso(idStatus);
            estadoCampos[campo.toLowerCase()] = true;
        }
        checarBotao();
    };

    // Validação CPF (exemplo com classe CPF já implementada)
    window.validarCPF = function(input) {
        try {
            const cpfObj = new CPF(input.value.trim());
            sucesso("statusCPF");
            estadoCampos.cpf = true;
        } catch (e) {
            erro("statusCPF", e.message);
            estadoCampos.cpf = false;
        }
        checarBotao();
    };

    // Validação do e-mail
    emailCadastroInput.addEventListener("blur", () => {
        const valor = emailCadastroInput.value.trim();
        const qtdArrobas = (valor.match(/@/g) || []).length;

        if (valor === '') {
            erro("statusEmail", "E-mail não pode estar vazio.");
            estadoCampos.email = false;
        } else if (qtdArrobas !== 1) {
            erro("statusEmail", "E-mail deve conter exatamente um '@'.");
            estadoCampos.email = false;
        } else {
            sucesso("statusEmail");
            estadoCampos.email = true;
        }
        checarBotao();
    });

    // Validação das senhas
    const validarSenhas = () => {
        const senha = senhaInput.value;
        const repetir = repetirSenhaInput.value;

        if (senha === '' || repetir === '') {
            erro("statusSenha", "Senha não pode estar vazia.");
            erro("statusRepitaSenha", "Repita sua senha.");
            estadoCampos.senha = false;
            estadoCampos.repetirSenha = false;
        } else if (senha !== repetir) {
            erro("statusRepitaSenha", "As senhas não coincidem.");
            sucesso("statusSenha");
            estadoCampos.senha = true;
            estadoCampos.repetirSenha = false;
        } else {
            sucesso("statusSenha");
            sucesso("statusRepitaSenha");
            estadoCampos.senha = true;
            estadoCampos.repetirSenha = true;
        }
        checarBotao();
    };

    senhaInput.addEventListener("blur", validarSenhas);
    repetirSenhaInput.addEventListener("blur", validarSenhas);

    // Validação CEP e preenchimento automático
    cepInput.addEventListener('blur', () => {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length === 8) {
            fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (!data.erro) {
                    logradouroInput.value = data.logradouro;
                    bairroInput.value = data.bairro;
                    municipioInput.value = data.localidade;
                    estadoInput.value = data.uf;

                    sucesso('statusCep');
                    sucesso('statusLogradouro');
                    sucesso('statusBairro');
                    sucesso('statusMunicipio');
                    sucesso('statusEstado');

                    estadoCampos.cep = true;
                    estadoCampos.logradouro = true;
                    estadoCampos.bairro = true;
                    estadoCampos.municipio = true;
                    estadoCampos.estado = true;
                } else {
                    alert("CEP não encontrado.");
                    logradouroInput.value = '';
                    bairroInput.value = '';
                    municipioInput.value = '';
                    estadoInput.value = '';
                    erro('statusCep', 'CEP inválido.');
                    estadoCampos.cep = false;
                }
                checarBotao();
            })
            .catch(() => {
                alert("Erro ao buscar CEP.");
                erro('statusCep', 'Erro ao buscar CEP.');
                estadoCampos.cep = false;
                checarBotao();
            });
        } else {
            erro('statusCep', 'CEP deve ter 8 dígitos.');
            estadoCampos.cep = false;
            checarBotao();
        }
    });

    // Validação simples para os demais campos (log, bairro, município, estado) para garantir preenchimento manual caso não seja pelo CEP
    [logradouroInput, bairroInput, municipioInput, estadoInput].forEach((input) => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                erro(`status${input.id.charAt(0).toUpperCase() + input.id.slice(1)}`, `${input.previousElementSibling.innerText.replace(':','')} não pode estar vazio.`);
                estadoCampos[input.id] = false;
            } else {
                sucesso(`status${input.id.charAt(0).toUpperCase() + input.id.slice(1)}`);
                estadoCampos[input.id] = true;
            }
            checarBotao();
        });
    });

    // Botão Criar conta
    botaoCriarConta.addEventListener("click", () => {
        const nome = nomeInput.value.trim();
        const sobrenome = sobrenomeInput.value.trim();
        const email = emailCadastroInput.value.trim();
        const cpf = new CPF(cpfInput.value.trim());
        const senha = senhaInput.value;

        const cep = cepInput.value.trim();
        const logradouro = logradouroInput.value.trim();
        const bairro = bairroInput.value.trim();
        const municipio = municipioInput.value.trim();
        const estado = estadoInput.value.trim();

        const novaConta = new Conta(nome, sobrenome, email, cpf, senha, cep, logradouro, bairro, municipio, estado);
        console.log("Conta criada:", novaConta);
        contas.push(novaConta);

        // Limpa os campos após cadastro
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        document.querySelectorAll('p[id^="status"]').forEach(p => p.innerHTML = '');
        botaoCriarConta.disabled = true;

        alert("Conta criada com sucesso! Veja no console.");
        mostrarApenasLogin();
    });
};

