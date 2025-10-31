const createUserForm = document.querySelector("[data-create-user-form]");
const editUserFormDialog = document.querySelector("[data-edit-user-form-dialog]");
const userContainer = document.querySelector("[data-user-container]");

const MOCK_API_URL = "https://69038df3d0f10a340b24dd28.mockapi.io/users";
let users = [];

// Получение пользователей 
const getUsersAsync = async () => {
    try {
        const response = await fetch(MOCK_API_URL);
        users = await response.json();
        renderUsers();
    } catch (error) {
        console.error("Ошибка при загрузке пользователей: ", error.message);
    }
};

//  Создание пользователя 
createUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(createUserForm);
    const formUserData = Object.fromEntries(formData);

    const newUserData = {
        name: formUserData.userName,
        city: formUserData.userCity,
        email: formUserData.userEmail,
        avatar: formUserData.userImageUrl
    };

    try {
        const response = await fetch(MOCK_API_URL, {
            method: "POST",
            body: JSON.stringify(newUserData),
            headers: { "Content-type": "application/json" }
        });
        const createdUser = await response.json();
        users.unshift(createdUser);
        renderUsers();
        createUserForm.reset();
        alert("Новый пользователь создан!");
    } catch (error) {
        console.error("Ошибка при создании пользователя: ", error.message);
    }
});

//  Редактирование пользователя
const editExistingUserAsync = async (newUserData) => {
    try {
        const response = await fetch(`${MOCK_API_URL}/${newUserData.id}`, {
            method: "PUT",
            body: JSON.stringify(newUserData),
            headers: { "Content-type": "application/json" }
        });
        const editedUser = await response.json();

        users = users.map(user => user.id === editedUser.id ? editedUser : user);
        renderUsers();
        editUserFormDialog.close();
        alert("Пользователь изменен!");
    } catch (error) {
        console.error("Ошибка при редактировании пользователя: ", error.message);
    }
};

//  Удаление пользователя 
const removeExistingUserAsync = async (userId) => {
    try {
        const response = await fetch(`${MOCK_API_URL}/${userId}`, { method: "DELETE" });
        const removedUser = await response.json();
        users = users.filter(user => user.id !== removedUser.id);
        renderUsers();
        alert("Пользователь удален!");
    } catch (error) {
        console.error("Ошибка при удалении пользователя: ", error.message);
    }
};

//  Отрисовка пользователей 
const renderUsers = () => {
    userContainer.innerHTML = "";
    users.forEach(user => {
        userContainer.insertAdjacentHTML("beforeend", `
            <div class="user-card">
                <h3>${user.name}</h3>
                <p>City: ${user.city}</p>
                <span>Email: ${user.email}</span>
                <img src="${user.avatar}" />
                <button class="user-edit-btn" data-user-id="${user.id}" data-user-edit-btn>🛠️</button>
                <button class="user-remove-btn" data-user-id="${user.id}" data-user-remove-btn>❌</button>
            </div>
        `);
    });
};

//  Клик по контейнеру 
userContainer.addEventListener("click", (e) => {
    const userId = e.target.dataset.userId;
    if (e.target.hasAttribute("data-user-remove-btn")) {
        if (confirm("Точно удалить пользователя?")) removeExistingUserAsync(userId);
    }
    if (e.target.hasAttribute("data-user-edit-btn")) {
        populateDialog(userId);
    }
});

// Заполнение диалога редактирования 
const populateDialog = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    editUserFormDialog.innerHTML = "";

    const editForm = document.createElement("form");
    editForm.classList.add("form");

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.classList.add("close-edit-form-btn");
    closeBtn.textContent = "❌";
    closeBtn.addEventListener("click", () => editUserFormDialog.close());

    editForm.innerHTML = `
        <input type="text" name="userId" value="${user.id}" hidden/>
        <div class="control-field">
            <label class="form-label">Name</label>
            <input type="text" name="userName" class="form-control" value="${user.name}" required minlength="2" maxlength="20">
        </div>
        <div class="control-field">
            <label class="form-label">City</label>
            <input type="text" name="userCity" class="form-control" value="${user.city}" required minlength="2" maxlength="20">
        </div>
        <div class="control-field">
            <label class="form-label">Email</label>
            <input type="email" name="userEmail" class="form-control" value="${user.email}" required>
        </div>
        <div class="control-field">
            <label class="form-label">Images</label>
            <select name="userImageUrl" class="form-control" required>
                <option value="">Image URL</option>
                <option value="img/anime.jpg" ${user.avatar==="img/anime.jpg" ? "selected":""}>Anime</option>
                <option value="img/dog.jpg" ${user.avatar==="img/dog.jpg" ? "selected":""}>Dog</option>
                <option value="img/cartoon.jpg" ${user.avatar==="img/cartoon.jpg" ? "selected":""}>Cartoon</option>
            </select>
        </div>
        <button class="btn submit-btn">Save Changes</button>
    `;

    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const formUserData = Object.fromEntries(formData);

        editExistingUserAsync({
            id: formUserData.userId,
            name: formUserData.userName,
            city: formUserData.userCity,
            email: formUserData.userEmail,
            avatar: formUserData.userImageUrl
        });
    });

    editUserFormDialog.append(editForm, closeBtn);
    editUserFormDialog.showModal();
};

getUsersAsync();
