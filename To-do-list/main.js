'use strict';


async function ServerRequest(url) {
    return fetch(url)
        .then(response => response.json())
        .then(commits => { return commits.tasks })
        .catch(error => alert(error.status));
}

function createURL(params) {
    let base = 'http://tasks-api.std-900.ist.mospolytech.ru/'
    let url = new URL(params, base);
    url.searchParams.set('api_key', '50d2199a-42dc-447d-81ed-d68a443b697e');
    return String(url);
}

function createURLl(params, id) {
    let base = 'http://tasks-api.std-900.ist.mospolytech.ru/'
    let url = new URL(params + '/' + id, base);
    url.searchParams.set('api_key', '50d2199a-42dc-447d-81ed-d68a443b697e');
    return String(url);
}


async function downloadForm() {
    let url = createURL('/api/tasks');
    let jsonData = await ServerRequest(url);
    console.log(jsonData);
    return jsonData;
}

function getTask(jsonData) {
    for (let i = 0; i < jsonData.length; i++) {
        let listElement = document.getElementById(`${jsonData[i].status}-list`); // ${form.elements['column'].value} = to-do | done 
        listElement.append(createTaskElementFromData(jsonData[i]));

        let tasksCounterElement = listElement.closest('.card').querySelector('.tasks-counter');
        tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) + 1;
    }
}

function createTaskElementFromData(jsonData) {
    console.log(jsonData);
    let newTaskElement = document.getElementById('task-template').cloneNode(true);
    newTaskElement.id = jsonData.id;
    newTaskElement.querySelector('.task-name').innerHTML = jsonData.name;
    newTaskElement.querySelector('.task-description').innerHTML = jsonData.desc;
    newTaskElement.querySelector('.task-id').innerHTML = jsonData.id;
    newTaskElement.classList.remove('d-none');
    for (let btn of newTaskElement.querySelectorAll('.move-btn')) {
        btn.onclick = moveBtnHandler;
    }
    return newTaskElement;
}

function showAlert(msg, category = 'success') {
    let alerts = document.querySelector('.alerts');
    let newAlertElement = document.querySelector('.alert-template').cloneNode(true);
    newAlertElement.querySelector('.msg').innerHTML = msg;
    newAlertElement.classList.remove('d-none');
    alerts.append(newAlertElement);
}

function showAlertW(msg, category = 'warning') {
    let alerts = document.querySelector('.alerts-warning');
    let newAlertElement = document.querySelector('.alert-template2').cloneNode(true);
    newAlertElement.querySelector('.msg').innerHTML = msg;
    newAlertElement.classList.remove('d-none');
    alerts.append(newAlertElement);
}

function showAlert3(msg, category = 'danger') {
    let alerts = document.querySelector('.alerts-danger');
    let newAlertElement = document.querySelector('.alert-template3').cloneNode(true);
    newAlertElement.querySelector('.msg').innerHTML = msg;
    newAlertElement.classList.remove('d-none');
    alerts.append(newAlertElement);
}

function createTaskElement(form) {
    let newTaskElement = document.getElementById('task-template').cloneNode(true);
    newTaskElement.id = form.id;
    newTaskElement.querySelector('.task-name').innerHTML = form.name;
    newTaskElement.querySelector('.task-description').innerHTML = form.desc;
    newTaskElement.classList.remove('d-none');
    for (let btn of newTaskElement.querySelectorAll('.move-btn')) {
        btn.onclick = moveBtnHandler;
    }
    console.log(newTaskElement);
    return newTaskElement;
}

async function postTask(form) {
    let formData = new FormData();
    formData.append('desc', form.elements['description'].value);
    formData.append('name', form.elements['name'].value);
    formData.append('status', form.elements['column'].value);

    let data = await fetch('http://tasks-api.std-900.ist.mospolytech.ru/api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json());
    console.log(data);
    return data;
}

function updateTask(form) {
   let taskElement = document.getElementById(form.elements['task-id'].value);
   let taskId = form.elements['task-id'].value;
   taskElement.querySelector('.task-name').innerHTML = form.elements['name'].value;
   taskElement.querySelector('.task-description').innerHTML = form.elements['description'].value;
   let putName = form.elements['name'].value;
   let putDesc = form.elements['description'].value;
   putTask(putName, putDesc, taskId);
}

function actionTaskBtnHandler(event) {
    let action, form, listElement, tasksCounterElement, alertMsg;
    form = event.target.closest('.modal').querySelector('form');
    action = form.elements['action'].value;

    if (action == 'create') {
        alertMsg = `Задача ${form.elements['name'].value} была успешно создана!`;
        listElement = document.getElementById(`${form.elements['column'].value}-list`); // ${form.elements['column'].value} = to-do | done 
        postTask(form)
            .then(array => listElement.append(createTaskElement(array)))
            .then(() => showAlert(alertMsg));

        tasksCounterElement = listElement.closest('.card').querySelector('.tasks-counter');
        tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) + 1;

    } else if (action == 'edit') {
        updateTask(form)
        alertMsg = `Задача ${form.elements['name'].value} была успешно обновлена!`;
        showAlert(alertMsg);
    }
}

function setFormValues(form, jsonData) {
    form.elements['name'].value = jsonData.name;
    form.elements['description'].value = jsonData.desc;
    form.elements['task-id'].value = jsonData.id;
} // переделали, чтобы данные только с сервера подгружались на просмотр 

function resetForm(form) {
    form.reset();
    form.querySelector('select').closest('.mb-3').classList.remove('d-none');
    form.elements['name'].classList.remove('form-control-plaintext');
    form.elements['description'].classList.remove('form-control-plaintext');
}

function prepareModalContent(event) {

    let form = event.target.querySelector('form');
    resetForm(form);

    let action = event.relatedTarget.dataset.action || 'create';

    form.elements['action'].value = action;
    event.target.querySelector('.modal-title').innerHTML = titles[action];
    event.target.querySelector('.action-task-btn').innerHTML = actionBtnText[action];

    if (action == 'edit' || action == 'show') {
        viewTask(event.relatedTarget.closest('.task').id)
            .then(jsonData => setFormValues(form, jsonData)); // загрузка данных и пердача в измнение модального окна 
        event.target.querySelector('select').closest('.mb-3').classList.add('d-none');
    }

    if (action == 'show') {
        form.elements['name'].classList.add('form-control-plaintext');
        form.elements['description'].classList.add('form-control-plaintext');
        form.elements['name'].classList.remove('form-control');
        form.elements['description'].classList.remove('form-control');
    }
}

async function deleteTask(deleteId) {
    let URL = createURLl('/api/tasks', deleteId);
    return fetch(URL, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        }
    });
}

async function putTask(putName, putDesc, taskId) {
    let formData = new FormData();
    formData.append('desc', putDesc);
    formData.append('name', putName);
    let url = createURLl('/api/tasks', taskId);
    return fetch(url, {
        method: 'PUT',
        body: formData
    }).then(response => response.json())
}

async function putTaskStatus(putStatus, taskId) {
    let formData = new FormData();
    formData.append('status', putStatus);
    let url = createURLl('/api/tasks', taskId);
    return fetch(url, {
        method: 'PUT',
        body: formData
    }).then(response => response.json())
}

async function viewTask(viewId) {
    let URL = createURLl('/api/tasks', viewId);
    return fetch(URL)
        .then(response => response.json())
        .then(commits => { return commits })
        .catch(error =>
            alert(error.status));
}

function deleteTaskBtnHandler(event) {
    let form = event.target.closest('.modal').querySelector('form');
    let alertMsg = `Задача была успешно удалена!`;
    let taskElement = document.getElementById(form.elements['task-id'].value);
    let deleteId = form.elements['task-id'].value;

    let tasksCounterElement = taskElement.closest('.card').querySelector('.tasks-counter');
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) - 1;
    if (alertMsg) {
        showAlertW(alertMsg);
    }

    deleteTask(deleteId).then(taskElement.remove()).then(console.log('успешно удалено'));
}

function moveBtnHandler(event) {
    let taskElement = event.target.closest('.task');
    let listElement = taskElement.closest('ul');
    let targetListElement = document.getElementById(listElement.id == 'to-do-list' ? 'done-list' : 'to-do-list');
    let putStatus;
    let taskId = taskElement.querySelector('.task-id').innerHTML;
    if (listElement.id == 'to-do-list')
        putStatus = 'done';
    else putStatus = 'to-do';
    putTaskStatus(putStatus, taskId);
    let tasksCounterElement = taskElement.closest('.card').querySelector('.tasks-counter')
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) - 1;

    targetListElement.append(taskElement);

    tasksCounterElement = targetListElement.closest('.card').querySelector('.tasks-counter')
    tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) + 1;
    let alertMsg = `Задача ${taskElement.querySelector('.task-name').innerHTML} была успешно обновлена!`;
    if (alertMsg) {
        showAlert(alertMsg);
    }
}

let taskCounter = 0;

let titles = {
    'create': 'Создание новой задачи',
    'show': 'Просмотр задачи',
    'edit': 'Редактирование задачи'
};

let actionBtnText = {
    'create': 'Создать',
    'show': 'Ок',
    'edit': 'Сохранить'
};

window.onload = function () {
    downloadForm().then(downloadData => getTask(downloadData));
    document.querySelector('.action-task-btn').onclick = actionTaskBtnHandler;
    document.getElementById('task-modal').addEventListener('show.bs.modal', prepareModalContent);
    document.getElementById('remove-task-modal').addEventListener('show.bs.modal', function (event) {
        let taskElement = event.relatedTarget.closest('.task');
        let form = event.target.querySelector('form');
        form.elements['task-id'].value = taskElement.id;
        event.target.querySelector('.task-name').innerHTML = taskElement.querySelector('.task-name').innerHTML;
    });
    document.querySelector('.delete-task-btn').onclick = deleteTaskBtnHandler;
    for (let btn of document.querySelectorAll('.move-btn')) {
        btn.onclick = moveBtnHandler;
    }
}