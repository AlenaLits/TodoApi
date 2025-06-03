const uri = '/api/TodoItems';
let todos = [];
let categories = [];
let authToken = null;

window.onload = () => {
    // Если токен сохранён в localStorage, загружаем его и данные
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
        authToken = savedToken;
        loadUserData();
    } else {
        getCategories(); // категории без авторизации могут быть пустыми, зависит от API
    }
    // Можно показать формы регистрации/входа, если нет токена
    setFilter('all');
};
// Отобразить задачи в таблице
function displayItems() {
    const tBody = document.getElementById('todos');
    tBody.innerHTML = '';
    // Фильтруем задачи согласно currentFilter
    let filteredTodos = todos;
    if (currentFilter === 'incomplete') {
        filteredTodos = todos.filter(t => !t.isComplete);
    } else if (currentFilter === 'complete') {
        filteredTodos = todos.filter(t => t.isComplete);
    }
    filteredTodos.forEach(item => {
        const tr = document.createElement('tr');

        // Интерактивный чекбокс выполнено
        const tdCheck = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.isComplete;

        // Обработчик клика — обновляем статус на сервере
        checkbox.addEventListener('change', () => {
            const updatedItem = {
                id: item.id,
                name: item.name,
                isComplete: checkbox.checked,
                categoryId: item.categoryId || null
            };

            fetch(`${uri}/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + authToken  // если требуется авторизация
                },
                body: JSON.stringify(updatedItem)
            })
                .then(() => getItems())
                .catch(error => {
                    console.error('Ошибка при обновлении статуса:', error);
                    checkbox.checked = !checkbox.checked; // откатить чекбокс при ошибке
                });
        });

        tdCheck.appendChild(checkbox);
        tr.appendChild(tdCheck);

        // Название задачи
        const tdName = document.createElement('td');
        tdName.textContent = item.name;
        tr.appendChild(tdName);

        //категория
        const tdCategory = document.createElement('td');
        const category = categories.find(c => c.id === item.categoryId);
        tdCategory.textContent = category ? category.name : '';
        tr.appendChild(tdCategory);


        // Кнопка редактировать
        const tdEdit = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Редактировать';
        editBtn.onclick = () => showEditForm(item.id);
        tdEdit.appendChild(editBtn);
        tr.appendChild(tdEdit);

        // Кнопка удалить
        const tdDelete = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.onclick = () => deleteItem(item.id);
        tdDelete.appendChild(deleteBtn);
        tr.appendChild(tdDelete);

        tBody.appendChild(tr);
    });
}
// Получить список задач
function getItems() {
    fetch(uri, {
        headers: { 'Authorization': 'Bearer ' + authToken }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.status);
            }
            // Проверяем, есть ли тело
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json();
            } else {
                return null; // или []
            }
        })
        .then(data => {
            if (data) {
                todos = data;
            } else {
                todos = [];
            }
            displayItems();
            displayCount();
        })
        .catch(error => console.error('Ошибка при получении данных:', error));
}

// Отобразить счетчик задач
function displayCount() {
    const counter = document.getElementById('counter');
    const incompleteCount = todos.filter(item => !item.isComplete).length;

    if (incompleteCount === 0) {
        counter.textContent = 'Все задачи выполнены!';
    } else if (incompleteCount === 1) {
        counter.textContent = 'Осталась 1 невыполненная задача';
    } else {
        counter.textContent = `Осталось ${incompleteCount} невыполненных задач`;
    }
}
// Получить категории
function getCategories() {
    fetch('/api/ItemCategories', {
        headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
    })
        .then(response => response.json())
        .then(data => {
            categories = data;
            populateCategorySelect();
        })
        .catch(error => console.error('Ошибка при загрузке категорий:', error));
}

// Заполнить селекты категорий
function populateCategorySelect() {
    const addSelect = document.getElementById('add-category');
    addSelect.innerHTML = '<option value="">-- Выберите категорию --</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        addSelect.appendChild(option);
    });

    const editSelect = document.getElementById('edit-category');
    editSelect.innerHTML = '<option value="">-- Выберите категорию --</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        editSelect.appendChild(option);
    });
}

// Добавить задачу
function addItem() {
    console.log('addItem вызван');
    const input = document.getElementById('add-name');
    const select = document.getElementById('add-category');
    const name = input.value.trim();
    const categoryId = select.value;

    if (!name) return;

    fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
            name: name,
            isComplete: false,
            categoryId: categoryId ? Number(categoryId) : null
        })
    })
        .then(() => {
            input.value = '';
            getItems();
        })
        .catch(error => console.error('Ошибка при добавлении:', error));
}

// Показать форму редактирования
function showEditForm(id) {
    const item = todos.find(t => t.id === id);
    if (!item) return;

    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-name').value = item.name;
    document.getElementById('edit-isComplete').checked = item.isComplete;

    const editSelect = document.getElementById('edit-category');
    editSelect.value = item.categoryId || '';

    document.getElementById('editForm').style.display = 'block';
}

// Закрыть форму редактирования
function closeEditForm() {
    document.getElementById('editForm').style.display = 'none';
}

// Обновить задачу
function updateItem() {
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('edit-name').value.trim();
    const isComplete = document.getElementById('edit-isComplete').checked;
    const categoryId = document.getElementById('edit-category').value;

    if (!name) return;

    fetch(`${uri}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({
            id: Number(id),
            name: name,
            isComplete: isComplete,
            categoryId: categoryId ? Number(categoryId) : null
        })
    })
        .then(() => {
            closeEditForm();
            getItems();
        })
        .catch(error => console.error('Ошибка при обновлении:', error));
}

// Удалить задачу
function deleteItem(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + authToken }
    })
        .then(() => getItems())
        .catch(error => console.error('Ошибка при удалении:', error));
}

// Добавить категорию
function addCategory() {
    const input = document.getElementById('add-category-name');
    const name = input.value.trim();

    if (!name) return;

    fetch('/api/ItemCategories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({ name: name })
    })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка при добавлении категории');
            return response.json();
        })
        .then(category => {
            input.value = '';
            getCategories();
            getItems();
        })
        .catch(error => console.error(error));
}

// Регистрация
function register() {
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();

    fetch('/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                const errors = errorData.errors || errorData;
                let messages = '';

                if (Array.isArray(errors)) {
                    messages = errors.map(e => e.description || e).join('\n');
                } else if (typeof errors === 'object') {
                    messages = Object.values(errors).flat().join('\n');
                } else {
                    messages = JSON.stringify(errors);
                }

                throw new Error(messages);
            }
            alert('Регистрация прошла успешно, теперь войдите');
            document.getElementById('registerForm').reset();
        })
        .catch(err => alert('Ошибка регистрации:\n' + err.message));

}

// Вход
function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    fetch('/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(res => {
            if (!res.ok) throw new Error('Неверный логин или пароль');
            return res.json();
        })
        .then(data => {
            authToken = data.token;
            localStorage.setItem('authToken', authToken); // сохраняем токен для сессии
            document.getElementById('authMessage').textContent = 'Вы вошли!';
            document.getElementById('loginForm').reset();
            loadUserData();
        })
        .catch(err => alert(err.message));
}

// Загрузить данные пользователя (задачи и категории)
function loadUserData() {
    if (!authToken) return;

    getCategories();
    getItems();
}
let currentFilter = 'all'; // 'all' | 'incomplete' | 'complete'

function setFilter(filter) {
    currentFilter = filter;

    // Обновляем стиль кнопок
    document.querySelectorAll('#filter-buttons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById('filter-' + filter).classList.add('active');

    displayItems();
}