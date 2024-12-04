document.addEventListener("DOMContentLoaded", function () {
    const database = firebase.database();  // Usando a instância já inicializada

    // Função para carregar as informações do usuário
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;

            // Referência ao perfil do usuário no Firebase Realtime Database
            const userRef = database.ref('usuarios/' + userId);
            userRef.once('value', snapshot => {
                const userData = snapshot.val();
                // Exibe as informações para visualização
                document.getElementById('user-name').textContent = userData.nome;
                document.getElementById('user-email').textContent = userData.email;
                document.getElementById('user-status').textContent = userData.status;
                document.getElementById('user-registration-date').textContent = userData.data;
                document.getElementById('user-dispositivos').textContent = userData.dispositivos;
                document.getElementById('user-logs').textContent = userData.logs;
            });
        } else {
            // Se o usuário não estiver autenticado, redireciona para login
            window.location.href = "index.html";
        }
    });

    // Abrir o formulário de edição de nome
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
        document.getElementById('edit-profile-form').classList.remove('hidden');
        document.getElementById('user-name').parentElement.classList.add('hidden'); // Esconde a visualização
    });

    // Cancelar a edição
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        document.getElementById('edit-profile-form').classList.add('hidden');
        document.getElementById('user-name').parentElement.classList.remove('hidden');
    });

    // Salvar o novo nome
    document.getElementById('profile-form').addEventListener('submit', (event) => {
        event.preventDefault();

        const userId = firebase.auth().currentUser.uid;
        const newName = document.getElementById('edit-name').value.trim();

        // Verifica se o nome não está vazio
        if (newName) {
            // Atualiza o nome no banco de dados
            firebase.database().ref('usuarios/' + userId).update({
                nome: newName
            }).then(() => {
                alert('Nome atualizado com sucesso!');
                document.getElementById('edit-profile-form').classList.add('hidden');
                document.getElementById('user-name').textContent = newName; // Atualiza o nome na visualização
                document.getElementById('user-name').parentElement.classList.remove('hidden'); // Mostra a visualização novamente
            }).catch((error) => {
                alert('Erro ao atualizar o nome: ' + error.message);
            });
        } else {
            alert('O nome não pode estar vazio!');
        }
    });

    // Função para deslogar o usuário
    document.getElementById('logout-btn').addEventListener('click', () => {
        const user = firebase.auth().currentUser;

        if (user) {
            const userId = user.uid;
            const userRef = firebase.database().ref('usuarios/' + userId);

            // Decrementa 1 no valor de logs
            userRef.once('value', snapshot => {
                const userData = snapshot.val();
                if (userData && userData.logs > 0) {
                    const newLogs = userData.logs - 1; // Decrementa o número de logs

                    // Atualiza a chave logs no Firebase
                    userRef.update({
                        logs: newLogs
                    }).then(() => {
                        // Desloga o usuário
                        firebase.auth().signOut().then(() => {
                            // Remove as informações salvas localmente
                            localStorage.removeItem('userLoggedIn');
                            localStorage.removeItem('userEmail');

                            // Redireciona para a tela de login
                            window.location.href = "login.html";
                        }).catch((error) => {
                            console.error("Erro ao deslogar: ", error);
                        });
                    }).catch((error) => {
                        console.error("Erro ao atualizar o número de logs: ", error);
                    });
                } else {
                    console.error("O número de logs não é válido.");
                }
            });
        }
    });
});
