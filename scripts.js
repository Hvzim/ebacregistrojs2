// 1. Gere seu endpoint em https://crudcrud.com/ e cole a URL abaixo.
// Exemplo: https://crudcrud.com/api/SEU_TOKEN/clientes
const API_URL = 'https://crudcrud.com/api/COLE_SEU_TOKEN_AQUI/clientes';

const form = document.querySelector('#client-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const clientList = document.querySelector('#client-list');
const emptyMessage = document.querySelector('#empty-message');
const statusMessage = document.querySelector('#status');
const submitButton = document.querySelector('#submit-button');

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle('error', isError);
}

function updateEmptyMessage() {
  emptyMessage.hidden = clientList.children.length > 0;
  if (clientList.children.length === 0) {
    emptyMessage.textContent = 'Nenhum cliente cadastrado.';
  }
}

function createClientElement(client) {
  const item = document.createElement('li');
  item.className = 'client-item';

  const details = document.createElement('div');
  details.className = 'client-details';

  const clientName = document.createElement('strong');
  clientName.textContent = client.name;
  const clientEmail = document.createElement('span');
  clientEmail.textContent = client.email;
  details.append(clientName, clientEmail);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.textContent = 'Excluir';
  deleteButton.setAttribute('aria-label', `Excluir ${client.name}`);
  deleteButton.addEventListener('click', () => deleteClient(client._id, item, deleteButton));

  item.append(details, deleteButton);
  return item;
}

async function loadClients() {
  emptyMessage.hidden = false;
  emptyMessage.textContent = 'Carregando clientes...';
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Erro ao buscar clientes (HTTP ${response.status}).`);
    const clients = await response.json();
    clientList.replaceChildren(...clients.map(createClientElement));
    updateEmptyMessage();
    console.log('Clientes recebidos da API:', clients);
  } catch (error) {
    emptyMessage.hidden = false;
    emptyMessage.textContent = 'Não foi possível carregar os clientes. Confira o endpoint do CrudCrud e tente novamente.';
    showStatus(error.message, true);
    console.error('Erro ao listar clientes:', error);
  }
}

async function createClient(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  if (!name || !email) {
    showStatus('Preencha o nome e o e-mail.', true);
    return;
  }

  submitButton.disabled = true;
  showStatus('Cadastrando cliente...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (!response.ok) throw new Error(`Erro ao cadastrar (HTTP ${response.status}).`);
    const savedClient = await response.json();
    clientList.appendChild(createClientElement(savedClient));
    updateEmptyMessage();
    form.reset();
    showStatus('Cliente cadastrado com sucesso!');
    console.log('Cliente cadastrado:', savedClient);
  } catch (error) {
    showStatus(`${error.message} Confira se o endpoint está correto.`, true);
    console.error('Erro ao cadastrar cliente:', error);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteClient(id, item, button) {
  if (!id) {
    showStatus('Não foi possível identificar o cliente para excluir.', true);
    return;
  }
  button.disabled = true;
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Erro ao excluir (HTTP ${response.status}).`);
    item.remove();
    updateEmptyMessage();
    showStatus('Cliente excluído com sucesso.');
    console.log('Cliente excluído:', id);
  } catch (error) {
    button.disabled = false;
    showStatus(error.message, true);
    console.error('Erro ao excluir cliente:', error);
  }
}

form.addEventListener('submit', createClient);
loadClients();
