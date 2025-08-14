// Banco de dados simulado
let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

// Duração dos serviços em minutos
const servicosDuracoes = {
    'Corte Clássico': 45,
    'Barba Completa': 30,
    'Corte + Barba': 75,
    'Hidratação Premium': 20,
    'Pigmentação de Barba': 40,
    'Design de Sobrancelhas': 15
};

// Preços dos serviços
const servicosPrecos = {
    'Corte Clássico': 60,
    'Barba Completa': 45,
    'Corte + Barba': 90,
    'Hidratação Premium': 40,
    'Pigmentação de Barba': 50,
    'Design de Sobrancelhas': 30
};

// Função para carregar agendamentos
function loadAgendamentos(date = null) {
    let filtered = [...agendamentos];
    
    if (date) {
        const filterDate = new Date(date);
        filtered = filtered.filter(ag => {
            const agDate = new Date(ag.start).toDateString();
            return agDate === filterDate.toDateString();
        });
    } else {
        // Mostrar agendamentos de hoje por padrão
        const today = new Date().toDateString();
        filtered = filtered.filter(ag => {
            const agDate = new Date(ag.start).toDateString();
            return agDate === today;
        });
    }
    
    const container = document.getElementById('agendamentos-container');
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-agendamentos">Nenhum agendamento encontrado</p>';
        return;
    }
    
    filtered.sort((a, b) => new Date(a.start) - new Date(b.start)).forEach(ag => {
        const agElement = document.createElement('div');
        agElement.className = 'agendamento-item';
        agElement.innerHTML = `
            <div class="agendamento-header">
                <span class="agendamento-time">${new Date(ag.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span class="agendamento-status ${ag.status}">${ag.status}</span>
            </div>
            <div class="agendamento-body">
                <h4>${ag.cliente}</h4>
                <p><i class="fas fa-phone"></i> ${ag.telefone}</p>
                <p><i class="fas fa-scissors"></i> ${ag.servico}</p>
                ${ag.observacoes ? `<p class="agendamento-obs"><i class="fas fa-comment"></i> ${ag.observacoes}</p>` : ''}
            </div>
            <div class="agendamento-actions">
                <button class="btn small-btn complete-btn" data-id="${ag.id}">
                    <i class="fas fa-check"></i> Concluir
                </button>
                <button class="btn small-btn cancel-btn" data-id="${ag.id}">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
        `;
        container.appendChild(agElement);
    });
    
    // Adicionar eventos aos botões
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateAgendamentoStatus(this.dataset.id, 'concluido');
        });
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateAgendamentoStatus(this.dataset.id, 'cancelado');
        });
    });
}

// Função para atualizar status do agendamento
function updateAgendamentoStatus(id, status) {
    const index = agendamentos.findIndex(ag => ag.id == id);
    if (index !== -1) {
        agendamentos[index].status = status;
        localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
        loadAgendamentos(document.getElementById('filter-date').value || null);
        loadStats();
        initAdminCalendar();
    }
}

// Função para carregar estatísticas
function loadStats() {
    const hoje = new Date().toDateString();
    const hojeAgendamentos = agendamentos.filter(ag => 
        new Date(ag.start).toDateString() === hoje && ag.status === 'confirmado');
    
    // Esta semana
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    
    const semanaAgendamentos = agendamentos.filter(ag => {
        const agDate = new Date(ag.start);
        return agDate >= startOfWeek && agDate <= endOfWeek && ag.status === 'confirmado';
    });
    
    // Calcular faturamento
    const faturamentoHoje = hojeAgendamentos.reduce((total, ag) => {
        const servico = ag.servico.split(' - ')[0];
        const preco = servicosPrecos[servico] || 0;
        return total + preco;
    }, 0);
    
    const faturamentoSemana = semanaAgendamentos.reduce((total, ag) => {
        const servico = ag.servico.split(' - ')[0];
        const preco = servicosPrecos[servico] || 0;
        return total + preco;
    }, 0);
    
    // Atualizar UI
    document.getElementById('stats-hoje').textContent = hojeAgendamentos.length;
    document.getElementById('stats-semana').textContent = semanaAgendamentos.length;
    document.getElementById('stats-faturamento').textContent = `R$ ${faturamentoSemana.toFixed(2)}`;
}

// Inicializar calendário admin
function initAdminCalendar() {
    const calendarEl = document.getElementById('admin-calendar');
    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
        },
        slotMinTime: '10:00:00',
        slotMaxTime: '19:00:00',
        weekends: false,
        allDaySlot: false,
        locale: 'pt-br',
        events: agendamentos.map(ag => ({
            title: `${ag.cliente} - ${ag.servico.split(' - ')[0]}`,
            start: ag.start,
            end: ag.end,
            color: ag.status === 'confirmado' ? '#00AA55' : 
                  ag.status === 'concluido' ? '#28a745' : 
                  ag.status === 'cancelado' ? '#dc3545' : '#6c757d',
            extendedProps: {
                telefone: ag.telefone,
                email: ag.email,
                observacoes: ag.observacoes,
                status: ag.status
            }
        })),
        eventClick: function(info) {
            const ag = info.event;
            const agData = ag.extendedProps;
            
            const agDetails = `
                <div class="agendamento-modal">
                    <h3>Detalhes do Agendamento</h3>
                    <p><strong>Cliente:</strong> ${ag.title.split(' - ')[0]}</p>
                    <p><strong>Telefone:</strong> ${agData.telefone}</p>
                    <p><strong>E-mail:</strong> ${agData.email || 'Não informado'}</p>
                    <p><strong>Serviço:</strong> ${ag.title.split(' - ')[1]}</p>
                    <p><strong>Data/Horário:</strong> ${ag.start.toLocaleString('pt-BR')}</p>
                    <p><strong>Status:</strong> <span class="status ${agData.status}">${agData.status}</span></p>
                    ${agData.observacoes ? `<p><strong>Observações:</strong> ${agData.observacoes}</p>` : ''}
                    <div class="modal-actions">
                        <button class="btn complete-btn" data-id="${ag.id}">
                            <i class="fas fa-check"></i> Concluir
                        </button>
                        <button class="btn cancel-btn" data-id="${ag.id}">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button class="btn close-modal">
                            <i class="fas fa-times"></i> Fechar
                        </button>
                    </div>
                </div>
            `;
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = agDetails;
            document.body.appendChild(modal);
            
            // Adicionar eventos aos botões
            modal.querySelector('.complete-btn')?.addEventListener('click', function() {
                updateAgendamentoStatus(this.dataset.id, 'concluido');
                modal.remove();
            });
            
            modal.querySelector('.cancel-btn')?.addEventListener('click', function() {
                updateAgendamentoStatus(this.dataset.id, 'cancelado');
                modal.remove();
            });
            
            modal.querySelector('.close-modal')?.addEventListener('click', function() {
                modal.remove();
            });
        }
    });

    calendar.render();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Carregar agendamentos
    loadAgendamentos();
    
    // Configurar calendário admin
    initAdminCalendar();
    
    // Botão de filtrar
    document.getElementById('filter-btn').addEventListener('click', function() {
        const date = document.getElementById('filter-date').value;
        loadAgendamentos(date || new Date().toISOString().split('T')[0]);
    });
    
    // Botão "Hoje"
    document.getElementById('today-btn').addEventListener('click', function() {
        document.getElementById('filter-date').value = '';
        loadAgendamentos();
    });
    
    // Carregar stats
    loadStats();
    
    // Configurar data atual no filtro
    document.getElementById('filter-date').valueAsDate = new Date();
});