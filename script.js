"use strict";

const STORAGE_KEY = "taskmanager_tasks";
const API_URL = "https://jsonplaceholder.typicode.com/todos";

const taskForm = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const priorityInput = document.getElementById("task-priority");

const formHeading = document.getElementById("form-heading");
const submitButton = document.getElementById("submit-task");
const cancelEditButton = document.getElementById("cancel-edit");

const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const searchInput = document.getElementById("search-tasks");
const statusFilter = document.getElementById("filter-status");
const sortSelect = document.getElementById("sort-tasks");

const totalTasksElement = document.getElementById("total-tasks");
const pendingTasksElement = document.getElementById("pending-tasks");
const completedTasksElement = document.getElementById("completed-tasks");

const notification = document.getElementById("notification");


let tasks = [];
let editingTaskId = null;
let notificationTimer = null;

function generateTaskId() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function showNotification(message, type = "info") {
    clearTimeout(notificationTimer);

    notification.textContent = message;
    notification.className = `show ${type}`;

    notificationTimer = setTimeout(() => {
        notification.textContent = "";
        notification.className = "";
    }, 4000);
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("No se pudieron guardar las tareas:", error);
        showNotification(
            "No se pudieron guardar los datos en el navegador.",
            "error"
        );
        return false;
    }
}

function loadSavedTasks() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData === null) {
            return null;
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            throw new Error("El almacenamiento no contiene una lista válida.");
        }

        return parsedData;
    } catch (error) {
        console.error("Error al recuperar las tareas:", error);

        showNotification(
            "No se pudieron recuperar las tareas guardadas.",
            "error"
        );

        return [];
    }
}

function notifyTasksChanged() {
    document.dispatchEvent(
        new CustomEvent("tasksChanged", {
            detail: {
                total: tasks.length
            }
        })
    );
}

document.addEventListener("tasksChanged", updateDashboard);

function updateDashboard() {
    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = tasks.filter(task => !task.completed).length;

    totalTasksElement.textContent = total;
    pendingTasksElement.textContent = pending;
    completedTasksElement.textContent = completed;
}

function createTask(title, description, priority) {
    const task = {
        id: generateTaskId(),
        title: title,
        description: description,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString(),
        source: "local"
    };

    tasks.push(task);

    if (!saveTasks()) {
        tasks.pop();
        return false;
    }

    notifyTasksChanged();

    return true;
}

function updateTask(id, title, description, priority) {
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        showNotification("No se encontró la tarea que deseas editar.", "error");
        return false;
    }

    const originalTask = tasks[index];

    const updatedTask = {
        ...originalTask,
        title: title,
        description: description,
        priority: priority
    };

    tasks[index] = updatedTask;

    if (!saveTasks()) {
        tasks[index] = originalTask;
        return false;
    }

    notifyTasksChanged();

    return true;
}

function deleteTask(id) {
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return;
    }

    const deletedTask = tasks[index];

    tasks.splice(index, 1);

    if (!saveTasks()) {
        tasks.splice(index, 0, deletedTask);
        return;
    }

    notifyTasksChanged();

    showNotification("Tarea eliminada correctamente.", "success");
}

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    const previousStatus = task.completed;

    task.completed = !task.completed;

    if (!saveTasks()) {
        task.completed = previousStatus;
        return;
    }

    notifyTasksChanged();

    showNotification(
        task.completed
            ? "Tarea marcada como completada."
            : "Tarea marcada como pendiente.",
        "success"
    );
}

function startEditingTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    editingTaskId = id;

    titleInput.value = task.title;
    descriptionInput.value = task.description;
    priorityInput.value = task.priority;

    formHeading.textContent = "Editar tarea";
    submitButton.textContent = "Guardar cambios";
    cancelEditButton.hidden = false;

    titleInput.focus();

    document.getElementById("task-form-section").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function resetTaskForm() {
    taskForm.reset();

    editingTaskId = null;

    formHeading.textContent = "Crear una tarea";
    submitButton.textContent = "Agregar tarea";
    cancelEditButton.hidden = true;
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value;

    if (title.length === 0) {
        showNotification(
            "El título es obligatorio y no puede contener solo espacios.",
            "error"
        );

        titleInput.focus();
        return;
    }

    if (title.length > 100) {
        showNotification("El título no puede superar los 100 caracteres.", "error");
        return;
    }

    if (description.length > 500) {
        showNotification(
            "La descripción no puede superar los 500 caracteres.",
            "error"
        );
        return;
    }

    if (!["high", "medium", "low"].includes(priority)) {
        showNotification("Selecciona una prioridad válida.", "error");
        return;
    }

    let success;

    if (editingTaskId !== null) {
        success = updateTask(
            editingTaskId,
            title,
            description,
            priority
        );

        if (success) {
            showNotification("Tarea actualizada correctamente.", "success");
        }
    } else {
        success = createTask(title, description, priority);

        if (success) {
            showNotification("Tarea creada correctamente.", "success");
        }
    }

    if (success) {
        resetTaskForm();
        renderTasks();
    }
});

cancelEditButton.addEventListener("click", resetTaskForm);


function getVisibleTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const selectedStatus = statusFilter.value;

    const selectedSort = sortSelect.value;

    const filteredTasks = tasks.filter(task => {
        const matchesTitle = task.title
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "pending" && !task.completed) ||
            (selectedStatus === "completed" && task.completed);

        return matchesTitle && matchesStatus;
    });


    const priorityOrder = {
        high: 3,
        medium: 2,
        low: 1
    };

    return filteredTasks.sort((a, b) => {
        switch (selectedSort) {
            case "oldest":
                return new Date(a.createdAt) - new Date(b.createdAt);

            case "high":
                return priorityOrder[b.priority] - priorityOrder[a.priority];

            case "low":
                return priorityOrder[a.priority] - priorityOrder[b.priority];

            case "newest":
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });
}

function renderTasks() {
    const visibleTasks = getVisibleTasks();

    taskList.replaceChildren();

    emptyMessage.hidden = visibleTasks.length > 0;

    if (visibleTasks.length === 0) {
        emptyMessage.textContent =
            tasks.length === 0
                ? "Todavía no hay tareas. ¡Crea la primera!"
                : "No se encontraron tareas con los filtros seleccionados.";

        return;
    }

    visibleTasks.forEach(task => {
        const card = document.createElement("article");

        card.className = task.completed
            ? "task-card completed"
            : "task-card";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent =
            task.description || "Sin descripción.";

        const priorityLabel = document.createElement("span");

        const priorityNames = {
            high: "Alta",
            medium: "Media",
            low: "Baja"
        };

        priorityLabel.className = `task-priority priority-${task.priority}`;
        priorityLabel.textContent = `Prioridad: ${priorityNames[task.priority]}`;

        const status = document.createElement("p");

        status.textContent = task.completed
            ? "Estado: Completada"
            : "Estado: Pendiente";
      
        const date = document.createElement("p");

        const createdDate = new Date(task.createdAt);

        date.textContent = `Creada: ${
            Number.isNaN(createdDate.getTime())
                ? "Fecha no disponible"
                : createdDate.toLocaleString("es-EC")
        }`;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");

        completeButton.type = "button";
        completeButton.className = "btn btn-success";
        completeButton.textContent = task.completed
            ? "Marcar pendiente"
            : "Completar";

        completeButton.addEventListener("click", () => {
            toggleTask(task.id);
            renderTasks();
        });

        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "btn btn-secondary";
        editButton.textContent = "Editar";

        editButton.addEventListener("click", () => {
            startEditingTask(task.id);
        });

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger";
        deleteButton.textContent = "Eliminar";

        deleteButton.addEventListener("click", () => {
            const confirmed = window.confirm(
                `¿Seguro que deseas eliminar "${task.title}"?`
            );

            if (confirmed) {
                deleteTask(task.id);
                renderTasks();
            }
        });

        actions.append(
            completeButton,
            editButton,
            deleteButton
        );

        card.append(
            title,
            description,
            priorityLabel,
            status,
            date,
            actions
        );

        taskList.appendChild(card);
    });
}

document.addEventListener("tasksChanged", renderTasks);

searchInput.addEventListener("input", renderTasks);

statusFilter.addEventListener("change", renderTasks);

sortSelect.addEventListener("change", renderTasks);

async function importTasksFromAPI() {
    try {
        showNotification(
            "Consultando tareas de la API...",
            "info"
        );

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const apiTasks = await response.json();

        if (!Array.isArray(apiTasks)) {
            throw new Error("La API devolvió datos no válidos.");
        }

        const importedTasks = apiTasks.slice(0, 20);

        const existingSources = new Set(
            tasks
                .filter(task => task.source === "api")
                .map(task => String(task.id))
        );

        const newTasks = importedTasks
            .filter(task => !existingSources.has(String(task.id)))
            .map(task => ({
                id: `api-${task.id}`,
                title: String(task.title),
                description: "",
                priority: "medium",
                completed: Boolean(task.completed),
                createdAt: new Date().toISOString(),
                source: "api"
            }));

        if (newTasks.length > 0) {
            tasks.push(...newTasks);

            if (!saveTasks()) {
                tasks.splice(-newTasks.length, newTasks.length);
                return;
            }

            notifyTasksChanged();
        }

        showNotification(
            newTasks.length > 0
                ? `Se importaron ${newTasks.length} tareas de la API.`
                : "No hay tareas nuevas para importar.",
            "success"
        );
    } catch (error) {
        console.error("Error al consultar la API:", error);

        showNotification(
            "No se pudo conectar con el servicio. Puedes seguir utilizando las tareas guardadas.",
            "error"
        );
    }
}

async function initializeApp() {
    const savedTasks = loadSavedTasks();

    if (savedTasks !== null) {
        tasks = savedTasks;

        notifyTasksChanged();
        renderTasks();

        showNotification(
            "Tareas locales recuperadas correctamente.",
            "success"
        );

        return;
    }
  
    tasks = [];

    notifyTasksChanged();
    renderTasks();

    await importTasksFromAPI();

    renderTasks();
}

initializeApp();
