const createUserForm = document.querySelector("[data-create-user-form]");
const editUserFormDialog = document.querySelector("[data-edit-user-form-dialog]");
const userContainer = document.querySelector("[data-user-container]");

const MOCK_API_URL = "https://69038df3d0f10a340b24dd28.mockapi.io/users"

let users = [];


// Клик по контейнеру
userContainer.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-user-edit-btn")) {
        const userId = e.target.dataset.userId;
        populateDialog(userId);
    }
});

// Отправка формы

createUserForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(createUserForm);
    const formUserData = Object.fromEntries(formData);

    const newUserData = {
        name: formUserData.userName,
        city: formUserData.userCity,
        email: formUserData.userEmail,
        avatar: formUserData.userImageUrl,
    }

    createNewUserAsync(newUserData);
})

// Редактирование пользователя
const editExistingUserAsync = async (newUserData) => {
    try {
        const response = await fetch(`${MOCK_API_URL}/${newUserData.id}`, {
            method: "PUT",
            body: JSON.stringify(newUserData),
            headers: {
                "Content-type": "application/json"
            }
        });

        if (response.status === 404) {
            throw new Error(`Клиентская ошибка`)
        }
        const editedUser = await response.json();

        users = users.map((user) => {
            if (user.id === editedUser.id) {
                return editedUser;
            }
            return user;
        })
        editUserFormDialog.close();
        renderUsers();

        createUserForm.reset();
        alert("Поменяли бро")

    } catch (error) {
        console.error("ОШИБКА при удалении пользователя: ", error.message);
    }
}



// Удаление пользователя

const removeExistingUserAsync = async (userId) => {
    try {
        const response = await fetch(`${MOCK_API_URL}/${userId}`, {
            method: "DELETE",
        });

        if (response.status === 404) {
            throw new Error(`${userId} не найден бро`);
        }

        const removedUser = await response.json();
        users = users.filter(user => user.id !== removedUser.id);
        renderUsers();

        alert("Бро удален(");

    } catch (error) {
        console.error("ОШИБКА при удалении пользователя: ", error.message);
        alert("Ошибка при удалении: " + error.message);
    }
};

//возможность создать пользователя

const createNewUserAsync = async (newUserData) => {
    try {
        const response = await fetch(MOCK_API_URL, {
            method: "POST",
            body: JSON.stringify(newUserData),
            headers: {
                "Content-type": "application/json"
            }
        });
        const newCreatedUser = await response.json();

        users.unshift(newCreatedUser);
        renderUsers();

        createUserForm.reset();
        alert("Новый бро создан")

    } catch (error) {
        console.error("ОШИБКА при создания новго пользователя: ", error.massage);
    }
}


// получение пользователей

const getUsersAsync = async () => {
    try {
        const response = await fetch(MOCK_API_URL);
        users = await response.json();

        renderUsers();
    } catch (error) {
        console.error("ПОЙМАННАЯ ОШИБКА: ", error.massage);
    }
}

// отрисовка пользователей
const renderUsers = () => {
    userContainer.innerHTML = "";

    users.forEach((user) => {
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
}


// Заполнение модального окна разметкой формы
const populateDialog = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    editUserFormDialog.innerHTML = "";

    const editForm = document.createElement("form");
    editForm.classList.add("form");

    const closeFormBtn = document.createElement("button");
    closeFormBtn.classList.add("close-edit-form-btn");
    closeFormBtn.type = "button";
    closeFormBtn.textContent = "❌";
    closeFormBtn.addEventListener("click", () => editUserFormDialog.close());

    editForm.innerHTML = `
        <input type="text" name="userId" value="${user.id}" hidden/>

        <div class="control-field">
            <label class="form-label">Name</label>
            <input type="text" class="form-control" name="userName" value="${user.name}" required minlength="2" maxlength="20">
        </div>

        <div class="control-field">
            <label class="form-label">City</label>
            <input type="text" class="form-control" name="userCity" value="${user.city}" required minlength="2" maxlength="20">
        </div>

        <div class="control-field">
            <label class="form-label">Email</label>
            <input type="email" class="form-control form-control--email" name="userEmail" value="${user.email}" required>
        </div>

        <div class="control-field">
            <label class="form-label">Images</label>
            <select name="userImageUrl" class="form-control form-control--images" required>
                <option value="">Image URL</option>
                <option value="img/anime.jpg" ${user.avatar === "img/anime.jpg" ? "selected" : ""}>Anime</option>
                <option value="img/dog.jpg" ${user.avatar === "img/dog.jpg" ? "selected" : ""}>Dog</option>
                <option value="img/cartoon.jpg" ${user.avatar === "img/cartoon.jpg" ? "selected" : ""}>Cartoon</option>
            </select>
        </div>

        <button class="btn submit-btn">Edit User</button>
    `;

    editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const formUserData = Object.fromEntries(formData);

        const newUserData = {
            id: formUserData.userId,
            name: formUserData.userName,
            city: formUserData.userCity,
            email: formUserData.userEmail,
            avatar: formUserData.userImageUrl,
        }

        editExistingUserAsync(newUserData);
    });

    editUserFormDialog.append(editForm, closeFormBtn);
    editUserFormDialog.showModal();
};

getUsersAsync();