// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDE1j0-ccXKXmc5pNqOfV_-bnysTi-Relw",
  authDomain: "painel-adm-fdc8e.firebaseapp.com",
  databaseURL: "https://painel-adm-fdc8e-default-rtdb.firebaseio.com",
  projectId: "painel-adm-fdc8e",
  storageBucket: "painel-adm-fdc8e.appspot.com",
  messagingSenderId: "203349021610",
  appId: "1:203349021610:web:40dc49eda62138aa0e91d3",
  measurementId: "G-VZ6D53C84N"
};

// Inicializando o Firebase
firebase.initializeApp(firebaseConfig);

// Referências aos elementos
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const toastElement = document.getElementById('toast');

// Função para exibir o Toast
function showToast(message, duration = 3000) {
  toastElement.textContent = message;
  toastElement.style.opacity = 1;

  // Remove o Toast após o tempo de duração
  setTimeout(() => {
    toastElement.style.opacity = 0;
  }, duration);
}

// Verificar se o usuário já está logado (somente com localStorage)
if (localStorage.getItem('userLoggedIn')) {
  window.location.href = "home.html"; // Se o usuário estiver logado, redireciona para home.html
}

// Função para realizar o login
loginBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  // Verificando se os campos de email e senha não estão vazios
  if (email && password) {
    // Autenticando o usuário no Firebase
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userId = user.uid;

        // Verificando dados do usuário no Firebase Realtime Database
        const userRef = firebase.database().ref('usuarios/' + userId);
        userRef.once('value', (snapshot) => {
          const userData = snapshot.val();

          // 1. Verificando o status do usuário (ativo ou não)
          if (userData.status !== "ativo") {
            showToast("Usuário não está ativo.");
            return;
          }

          // 2. Verificando se a data está vencida
          const currentDate = new Date();
          const userDate = new Date(userData.data.split('/').reverse().join('/')); // Converte para formato de data
          if (userDate < currentDate) {
            showToast("Sua conta está vencida.");
            return;
          }

          // 3. Verificando o número de logins
          if (userData.logs >= userData.dispositivos) {
            showToast("Número máximo de dispositivos atingido.");
            return;
          }

          // 4. Se todas as verificações passarem, faz login e atualiza a variável logs
          const newLogs = userData.logs + 1;  // Incrementa o valor de logs

          userRef.update({
            logs: newLogs  // Atualiza o valor de logs no banco
          }).then(() => {
            showToast("Login realizado com sucesso!");

            // Salva o estado de login no localStorage
            localStorage.setItem('userLoggedIn', true);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userId', userId);  // Você pode salvar outros dados, se necessário

            window.location.href = "home.html"; // Redireciona para a página principal
          }).catch((error) => {
            console.error("Erro ao atualizar logs:", error);
            showToast("Erro ao atualizar o número de logins.");
          });
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Erro no login:", errorCode, errorMessage);
        showToast("Erro ao fazer login. Verifique suas credenciais.");
      });
  } else {
    showToast("Por favor, preencha todos os campos.");
  }
});
