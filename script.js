
const createUserForm = document.querySelector("[data-create-user-form]");
const userContainer = document.querySelector("[data-user-container]");

const MOCK_API_URL = "https://69038df3d0f10a340b24dd28.mockapi.io/users"

// Отправка формы

createUserForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(createUserForm);
    const formUserData = Object.fromEntries(formData);

    console.log(formUserData);
})


// получение пользователей

const getUsersAsync = async () => {
    try{
        const response = await fetch(MOCK_API_URL);
        const users =await response.json();

        console.log(users);
    } catch (error) {
        console.error("ПОЙМАННАЯ ОШИБКА: ", error.massage);
    }
}

getUsersAsync();