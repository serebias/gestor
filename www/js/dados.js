document.addEventListener("DOMContentLoaded", function () {
    const database = firebase.database();  // Usando a instância já inicializada

    // Função para calcular os totais
    function updateDashboardData() {
        const userId = localStorage.getItem("userId"); // Recupera o userId localmente
        const clientsRef = database.ref('clientes');
        
        // Obter todos os clientes
        clientsRef.once('value', function(snapshot) {
            const clientsList = snapshot.val();
            let activeClients = 0;
            let expiredClients = 0;
            let dueSoonClients = 0;
            let totalValue = 0;

            if (clientsList) {
                // Iterar sobre todos os clientes
                Object.keys(clientsList).forEach(clientId => {
                    const client = clientsList[clientId];

                    // Filtra clientes que pertencem ao userId logado
                    if (client.userId !== userId) {
                        return; // Ignora clientes que não pertencem ao usuário logado
                    }

                    const dueDate = convertToDate(client.dueDate);
                    const today = new Date();

                    // Verificar o status do cliente
                    if (dueDate < today) {
                        expiredClients++; // Clientes expirados
                    } else if (dueDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)) {
                        // Clientes que vencem até 3 dias a partir de hoje
                        dueSoonClients++; 
                    } else {
                        activeClients++; // Clientes ativos
                    }

                    // Somar o valor dos clientes
                    totalValue += parseFloat(client.planValue.replace('R$', '').trim());
                });

                // Atualizar os valores na interface
                document.getElementById('clientes-ativos').textContent = activeClients;
                document.getElementById('clientes-expirados').textContent = expiredClients;
                document.getElementById('clientes-a-vencer').textContent = dueSoonClients;
                document.getElementById('valor-mensal').textContent = `R$ ${totalValue.toFixed(2)}`;
            }
        });
    }

    // Função para converter a data para o formato Date do JavaScript
    function convertToDate(dateString) {
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day); // Mês começa de 0 em JavaScript
    }

    // Chamar a função para atualizar os dados ao carregar a página
    updateDashboardData();
});
