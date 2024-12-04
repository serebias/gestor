// Elementos do DOM
const calendarHeader = document.getElementById('month-year');
const calendarDays = document.querySelector('.calendar-days');
const calendarDates = document.querySelector('.calendar-dates');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// Dias da semana
const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Inicialização
let currentDate = new Date();
let selectedDate = null;  // Variável para armazenar a data selecionada

function formatDate(date) {
  if (!date) return ''; // Caso a data não esteja definida
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Atualiza o cabeçalho
  calendarHeader.textContent = `${currentDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase()} ${year}`;

  // Renderiza os dias da semana
  calendarDays.innerHTML = '';
  daysOfWeek.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = day;
    calendarDays.appendChild(dayDiv);
  });

  // Limpa as datas
  calendarDates.innerHTML = '';

  // Primeiro dia do mês
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Último dia do mês
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  // Preenche os espaços vazios antes do primeiro dia
  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyDiv = document.createElement('div');
    calendarDates.appendChild(emptyDiv);
  }

  // Preenche os dias do mês
  for (let date = 1; date <= lastDateOfMonth; date++) {
    const dateDiv = document.createElement('div');
    dateDiv.textContent = date;

    // Destaque para o dia atual
    if (
      date === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
      dateDiv.classList.add('today');
    }

    // Verifica se o dia foi selecionado
    if (selectedDate && selectedDate.getDate() === date && selectedDate.getMonth() === month && selectedDate.getFullYear() === year) {
      dateDiv.classList.add('selected');  // Adiciona a classe para o dia selecionado
    }

    // Adiciona o ouvinte de clique para selecionar o dia
    dateDiv.addEventListener('click', () => {
      selectedDate = new Date(year, month, date);  // Atualiza a data selecionada
      console.log(`Data selecionada: ${formatDate(selectedDate)}`); // Exibe a data selecionada no console
      renderCalendar();  // Re-renderiza o calendário para atualizar o destaque
    });

    calendarDates.appendChild(dateDiv);
  }
}

// Navegação pelos meses
prevMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Renderiza o calendário ao carregar a página
renderCalendar();
