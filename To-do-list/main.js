'use strict';


async function ServerRequest(url) {
    return fetch(url)
        .then(response => response.json())
        .then(commits => { return commits.tasks })
        .catch(() => errorAlert());
}

function errorAlert() {
    let errorMsg = 'Пользователь с указанным api_key не найден!';
    if (errorMsg) {
        showAlert3(errorMsg);
    }
}

async function ServerRequest2(url) {
    return fetch(url)
        .then(response => response.json());
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
    if (jsonData == undefined) errorAlert();
    console.log(jsonData);
    return jsonData;
}

async function downloadTaskId(taskId) {
    let url = createURLl('/api/tasks', taskId);
    let jsonData = await ServerRequest2(url);
    console.log(jsonData);
    return jsonData;
}

function getTask(jsonData) {
    for (let i = 0; i < jsonData.length; i++) {
        let listElement = document.getElementById(`${jsonData[i].status}-list`);
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
    console.log(newTaskElement.querySelector('.task-id').innerHTML);
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
    newTaskElement.id = taskCounter++;
    newTaskElement.querySelector('.task-name').innerHTML = form.elements['name'].value;
    newTaskElement.querySelector('.task-description').innerHTML = form.elements['description'].value;
    newTaskElement.classList.remove('d-none');
    for (let btn of newTaskElement.querySelectorAll('.move-btn')) {
        btn.onclick = moveBtnHandler;
    }
    return newTaskElement;
}

async function postTask(form) {
    let formData = new FormData();
    formData.append('desc', form.elements['description'].value);
    formData.append('name', form.elements['name'].value);
    formData.append('status', form.elements['column'].value);

    return fetch('http://tasks-api.std-900.ist.mospolytech.ru/api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
}

const deleteTask = async (deleteId) => {
    let URL = createURLl('/api/tasks', deleteId);
    const response = await fetch(URL, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: null
    });

    const data = await response.json();
    console.log(data);
};

function updateTask(form) {
    let taskElement = document.getElementById(form.elements['task-id'].value);
    let taskId = form.elements['task-id'].value;
    let putName = taskElement.querySelector('.task-name').innerHTML;
    putName = form.elements['name'].value;
    let putDesc = taskElement.querySelector('.task-description').innerHTML;
    putDesc = form.elements['description'].value;
    putTask(putName, putDesc, taskId);
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

function actionTaskBtnHandler(event) {
    let action, form, listElement, tasksCounterElement, alertMsg;
    form = event.target.closest('.modal').querySelector('form');
    action = form.elements['action'].value;


    if (action == 'create') {
        listElement = document.getElementById(`${form.elements['column'].value}-list`);
        listElement.append(createTaskElement(form));


        tasksCounterElement = listElement.closest('.card').querySelector('.tasks-counter');
        tasksCounterElement.innerHTML = Number(tasksCounterElement.innerHTML) + 1;

        postTask(form);

        alertMsg = `Задача ${form.elements['name'].value} была успешно создана!`;
    } else if (action == 'edit') {
        updateTask(form);
        alertMsg = `Задача ${form.elements['name'].value} была успешно обновлена!`;
    }

    if (alertMsg) {
        showAlert(alertMsg);
    }
}

function setFormValues(form, jsonData) {
    let taskElement = document.getElementById(jsonData.id);
    form.elements['name'].value = jsonData.name;
    form.elements['description'].value = jsonData.desc;
    form.elements['task-id'].value = jsonData.id;
}

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
        downloadTaskId(event.relatedTarget.closest('.task').id).then(jsonData => setFormValues(form, jsonData));
        event.target.querySelector('select').closest('.mb-3').classList.add('d-none');
    }

    if (action == 'show') {
        form.elements['name'].classList.add('form-control-plaintext');
        form.elements['description'].classList.add('form-control-plaintext');
    }
}

function deleteTaskBtnHandler(event) {
    let form = event.target.closest('.modal').querySelector('form');
    let alertMsg = `Задача ${form.elements['task-id'].value} была успешно удалена!`;
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

