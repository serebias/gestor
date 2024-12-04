document.addEventListener("DOMContentLoaded", function () {
    // Variável global para armazenar o ID do cliente em edição
    let editClientId = null;
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

    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

// Função para listar clientes
    

// Função para listar clientes
function listClients() {
    const userId = localStorage.getItem("userId"); // Recupera o userId localmente
    const clientsRef = database.ref('clientes');
    
    clientsRef.orderByChild('dueDate').once('value', function (snapshot) {
        const clientsList = snapshot.val();
        const clientsListContainer = document.getElementById('clientes-list');
        const searchInput = document.getElementById('searchInput'); // Referência ao campo de pesquisa
        clientsListContainer.innerHTML = ''; // Limpar lista atual

        if (clientsList) {
            const sortedClients = Object.keys(clientsList).map(key => ({
                id: key,
                ...clientsList[key]
            })).sort((a, b) => {
                const dateA = convertToDate(a.dueDate);
                const dateB = convertToDate(b.dueDate);
                return dateA - dateB;
            });

            // Filtrar clientes pelo nome e userId
            const filteredClients = sortedClients.filter(client => {
                const searchTerm = searchInput.value.toLowerCase();
                return client.name.toLowerCase().includes(searchTerm) && client.userId === userId; // Filtra pelo userId
            });

            filteredClients.forEach(client => {
                const card = document.createElement('div');
                card.classList.add('client-card');

                // Aplique a lógica de borda colorida
                const cardBorderClass = getBorderColor(client.dueDate); // Aplica a classe de borda

                card.classList.add(cardBorderClass);
                card.innerHTML = `
                <div class="client-header">
                <div>
                <span>${client.name}</span>
                </div>
                <span>${client.dueDate}</span>
                </div>
                <div class="client-info">
                <p><strong>Telefone:</strong> ${client.phone}</p>
                <p><strong>Servidor:</strong> ${client.server}</p>
                <p><strong>Valor:</strong> R$ ${client.planValue}</p>
                </div>
                <div class="client-actions">
                <button class="btn btn-edit" onclick="editClient('${client.id}')">
                <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-delete" onclick="deleteClient('${client.id}')">
                <i class="fas fa-trash-alt"></i> Excluir
                </button>
                <button class="btn btn-whatsapp" onclick="openWhatsApp('${client.phone}', '${client.name}')">
                <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                <button class="btn btn-add-days" onclick="add30Days('${client.id}', '${client.dueDate}')">
                <i class="fas fa-calendar-plus"></i> Add 30 Dias
                </button>
                </div>
                `;
                clientsListContainer.appendChild(card);
            });
        } else {
            clientsListContainer.innerHTML = '<p>Nenhum cliente encontrado.</p>';
        }
    });
}



// Função para verificar a cor da borda
function getBorderColor(dueDate) {
    const today = new Date();
    const clientDueDate = convertToDate(dueDate);

    // Comparação apenas de dia, mês e ano (sem considerar hora, minuto, segundo)
    const todayDateString = today.toISOString().split('T')[0]; // Obtém a data no formato YYYY-MM-DD
    const clientDueDateString = clientDueDate.toISOString().split('T')[0]; // Obtém a data do cliente no formato YYYY-MM-DD

    if (clientDueDateString < todayDateString) {
        return 'overdue'; // Vencido (vermelho)
    } else if (clientDueDateString === todayDateString) {
        return 'due-today'; // Vence hoje (amarelo)
    } else if (clientDueDateString <= addDays(todayDateString, 3)) {
        return 'due-soon'; // Vence em até 3 dias (laranja)
    } else {
        return 'active'; // Não venceu (verde)
    }
}

// Função para adicionar dias a uma data (usado para checar se vence em até 3 dias)
function addDays(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // Retorna a data no formato YYYY-MM-DD
}

// Evento de pesquisa
document.getElementById('searchInput').addEventListener('input', function () {  
    listClients();
});

// Chame a função `listClients` para carregar a lista de clientes ao carregar a página
window.onload = listClients;



    // Função para converter a data no formato "DD/MM/YYYY" para "YYYY-MM-DD"
function convertToDate(dateString) {
    const parts = dateString.split('/');
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Retorna no formato "YYYY-MM-DD"
    }

    // Função para abrir WhatsApp com saudação
    window.openWhatsApp = function (phone, name) {
        const message = `Olá ${name}, tudo bem?`;
        const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Função para adicionar 1 mês à data de vencimento de um cliente
    window.add30Days = function (clientId, currentDate) {
    // Divide a data atual no formato 'DD/MM/YYYY' em partes: dia, mês e ano
        const parts = currentDate.split('/');

    // Cria um objeto Date a partir da data fornecida, formatando para 'YYYY-MM-DD'
    const newDate = new Date(parts[2], parts[1] - 1, parts[0]); // Mês começa em 0, então subtrai 1
    
    // Adiciona 1 mês à data
    newDate.setMonth(newDate.getMonth() + 1); // Soma 1 mês

    // Formata a nova data para o formato 'DD/MM/YYYY'
    const updatedDate = [
        ('0' + newDate.getDate()).slice(-2), // Adiciona zero à esquerda, se necessário
        ('0' + (newDate.getMonth() + 1)).slice(-2), // Adiciona zero ao mês, se necessário
        newDate.getFullYear() // Obtém o ano da nova data
    ].join('/'); // Junta as partes da data no formato 'DD/MM/YYYY'

    // Referência ao cliente no banco de dados Firebase
    const clientRef = database.ref('clientes/' + clientId);
    
    // Atualiza a data de vencimento do cliente no banco de dados
    clientRef.update({ dueDate: updatedDate })
    .then(() => {
            // Exibe uma mensagem de sucesso ao atualizar a data
        alert('Data de vencimento atualizada!');
            listClients(); // Atualiza a lista de clientes
        })
    .catch(error => {
            // Exibe uma mensagem de erro se a atualização falhar
        console.error('Erro ao atualizar a data de vencimento:', error);
        alert('Erro ao atualizar a data de vencimento.');
    });
};


    // Função para adicionar ou editar um cliente
const addClientForm = document.getElementById("add-client-form");

addClientForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const clientName = document.getElementById("client-name").value;
    const clientPhone = document.getElementById("client-phone").value;
    const server = document.getElementById("servidor").value;
    const planValue = document.getElementById("client-plan-value").value;
    const dueDate = document.getElementById("calendar-display").value;

    // Recupera o userId localmente
    const userId = localStorage.getItem("userId");

    const clientData = {
        name: clientName,
        phone: clientPhone,
        server: server,
        planValue: planValue,
        dueDate: dueDate,
        userId: userId  // Adiciona o userId ao cliente
    };

    const clientsRef = database.ref('clientes');

    if (editClientId) {
        // Modo de edição
        clientsRef.child(editClientId).update(clientData)
        .then(() => {
            alert("Cliente atualizado com sucesso!");
            resetForm();
            listClients();  // Recarregar a lista de clientes

            // Agora, ocultamos o formulário e mostramos a lista de clientes
            const formulario = document.getElementById("add-client-form");
            const listaClientes = document.getElementById("clientes-list");
            const botaoAdicionar = document.getElementById("mostarCadastro");
            const searchInput = document.getElementById('searchInput');
            const lista = document.getElementById('listaClientes');

            // Exibir lista
            lista.style.display = "block";
            // Oculta o formulário
            formulario.style.display = "none";
            // Exibe a lista de clientes
            listaClientes.style.display = "block";
            // Exibe o botão "Adicionar Cliente"
            botaoAdicionar.style.display = "block";
            // Exibe o campo de pesquisa
            searchInput.style.display = "block";
        })
        .catch((error) => {
            console.error("Erro ao atualizar cliente: ", error);
            alert("Erro ao atualizar cliente.");
        });
    } else {
        // Modo de adição
        clientsRef.push(clientData)
        .then(() => {
            alert("Cliente adicionado com sucesso!");
            resetForm();
            listClients();  // Recarregar a lista de clientes

            // Agora, ocultamos o formulário e mostramos a lista de clientes
            const formulario = document.getElementById("add-client-form");
            const listaClientes = document.getElementById("clientes-list");
            const botaoAdicionar = document.getElementById("mostarCadastro");
            const searchInput = document.getElementById('searchInput');
            const lista = document.getElementById('listaClientes');

            // Exibir lista
            lista.style.display = "block";
            // Oculta o formulário
            formulario.style.display = "none";
            // Exibe a lista de clientes
            listaClientes.style.display = "block";
            // Exibe o botão "Adicionar Cliente"
            botaoAdicionar.style.display = "block";
            // Exibe o campo de pesquisa
            searchInput.style.display = "block";
        })
        .catch((error) => {
            console.error("Erro ao adicionar cliente: ", error);
            alert("Erro ao adicionar cliente.");
        });
    }
});



    // Função para resetar o formulário
function resetForm() {
    addClientForm.reset();
    editClientId = null;
    document.getElementById("submit-button").textContent = "Salvar";
}

// Função para editar um cliente
window.editClient = function (clientId) {
    const clientRef = database.ref('clientes/' + clientId);
    clientRef.once('value', function (snapshot) {
        const client = snapshot.val();

        // Preenche os campos do formulário com os dados do cliente
        document.getElementById("client-name").value = client.name;
        document.getElementById("client-phone").value = client.phone;
        document.getElementById("servidor").value = client.server;
        document.getElementById("client-plan-value").value = client.planValue;
        document.getElementById("calendar-display").value = client.dueDate;

        // Define o ID do cliente para edição
        editClientId = clientId;

        // Atualiza o texto do botão de envio
        document.getElementById("submit-button").textContent = "Salvar Alterações";

        // Exibe o formulário de cadastro e oculta o botão "mostrarCadastro"
        const formulario = document.getElementById("add-client-form");
        formulario.style.display = "block"; // Mostra o formulário
        const mostrarCadastro = document.getElementById("mostarCadastro");
        mostrarCadastro.style.display = "none"; // Oculta o botão "Adicionar Cliente"
        const listaClientes = document.getElementById("clientes-list");
        listaClientes.style.display = "none"; // Oculta a lista de clientes

        // Oculta o campo de pesquisa
        const searchInput = document.getElementById('searchInput');
        searchInput.style.display = "none"; // Oculta o campo de pesquisa quando em edição
    });
};


// Função para cancelar e voltar à lista
document.getElementById("cancelar").addEventListener("click", function (e) {
    e.preventDefault(); // Evita o comportamento padrão do botão
    const formulario = document.getElementById("add-client-form");
    const listaClientes = document.getElementById("clientes-list");
    const botaoAdicionar = document.getElementById("mostarCadastro");
    const searchInput = document.getElementById('searchInput'); // Referência ao campo de pesquisa

    // Resetar o formulário
    resetForm();

    // Exibe a lista de clientes, oculta o formulário e garante que o campo de pesquisa esteja visível
    formulario.style.display = "none"; // Oculta o formulário
    listaClientes.style.display = "block"; // Mostra a lista de clientes
    botaoAdicionar.style.display = "block"; // Mostra o botão "Adicionar cliente"
    searchInput.style.display = "block"; // Garante que o campo de pesquisa esteja visível
});



    // Função para excluir um cliente
window.deleteClient = function (clientId) {
    const clientRef = database.ref('clientes/' + clientId);
    clientRef.remove()
    .then(() => {
        alert("Cliente excluído com sucesso!");
        listClients();
    })
    .catch((error) => {
        console.error("Erro ao excluir cliente: ", error);
        alert("Erro ao excluir cliente.");
    });
};

// Função para exibir o formulário de cadastro e ocultar lista
document.getElementById("mostarCadastro").addEventListener("click", function () {
    const formulario = document.getElementById("add-client-form");
    const listaClientes = document.getElementById("listaClientes");

    formulario.style.display = "block"; // Mostra o formulário
    listaClientes.style.display = "none"; // Oculta a lista de clientes
    this.style.display = "none"; // Oculta o botão "Adicionar clientes"
});

// Função para cancelar e voltar à lista
document.getElementById("cancelar").addEventListener("click", function (e) {
    e.preventDefault(); // Evita o comportamento padrão do botão
    const formulario = document.getElementById("add-client-form");
    const listaClientes = document.getElementById("listaClientes");
    const botaoAdicionar = document.getElementById("mostarCadastro");

    formulario.style.display = "none"; // Oculta o formulário
    listaClientes.style.display = "block"; // Mostra a lista de clientes
    botaoAdicionar.style.display = "block"; // Mostra o botão "Adicionar clientes"
});



    // Inicializando o Flatpickr no input com calendário sempre visível
flatpickr("#calendar-display", {
        locale: "pt", // Definindo o idioma para português
        dateFormat: "d/m/Y", // Formato da data
        inline: true, // Faz o calendário ficar sempre visível
        minDate: "today", // Data mínima (hoje)
        maxDate: new Date().fp_incr(365), // Data máxima (um ano a partir de hoje)
        onChange: function(selectedDates, dateStr, instance) {
            // Atualizando o campo de texto com a data selecionada
            document.getElementById("calendar-display").value = dateStr;
        }
    });

    // Exibir a lista de clientes ao carregar a página
listClients();
});

// Seleciona os elementos relevantes
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');
const menuLinks = document.querySelectorAll('.sidebar a');

    // Seleciona as seções
const inicioSection = document.getElementById('inicio-section');
const clientesSection = document.getElementById('clientes-section');

    // Esconde a seção de clientes ao carregar
    clientesSection.classList.add('hidden'); // Seção de clientes começa oculta

    // Exibe a seção "Início" ao carregar
    inicioSection.classList.remove('hidden'); // Seção de início começa visível

    // Exibe ou esconde o menu lateral ao clicar no botão
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });



    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
        // Fecha o menu lateral
            sidebar.classList.remove('active');

        // Alterar título do dashboard conforme a seção selecionada
        const sectionId = link.getAttribute('href').substring(1); // Obtém a seção do link
        const dashboardTitle = document.getElementById('dashboard-title');
        dashboardTitle.textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

        // Ocultar todas as seções
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.add('hidden'));

        // Exibir a seção clicada
        const activeSection = document.getElementById(`${sectionId}-section`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }

        // ** Gerenciar a marcação do botão selecionado **
        menuLinks.forEach(item => item.classList.remove('active')); // Remove 'active' de todos os links
        link.classList.add('active'); // Adiciona 'active' ao link clicado
    });
    });
