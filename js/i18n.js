/**
 * Sandukhar i18n - Модуль интернационализации (Локализация RU/EN)
 * Полная финальная версия. Полностью готовая к использованию.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Язык по умолчанию — русский ('ru')
    const DEFAULT_LANG = "ru";
    
    // Получаем ранее сохраненный язык из браузера или устанавливаем дефолтный
    let currentLang = localStorage.getItem("lang") || DEFAULT_LANG;
    
    // Объект, в который будут загружены переводы из JSON
    let translations = {};

    /**
     * Загружает JSON-файл перевода с сервера.
     * Проверяет два возможных пути размещения файлов.
     */
    async function loadTranslations(lang) {
        try {
            // Пробуем загрузить из папки /locales/ в корне сайта
            let response = await fetch(`./locales/${lang}.json`);
            
            // Если не нашли, пробуем альтернативный путь в папке js
            if (!response.ok) {
                response = await fetch(`./js/locales/${lang}.json`);
            }
            
            if (!response.ok) {
                throw new Error(`Файл перевода для языка "${lang}" не найден по стандартным путям.`);
            }
            
            translations = await response.json();
        } catch (error) {
            console.error("Ошибка локализации [Sandukhar i18n]:", error);
        }
    }

    /**
     * Позволяет безопасно получать значения по вложенным ключам (например, "nav.catalog")
     */
    function getNestedValue(obj, keyPath) {
        if (!obj || !keyPath) return null;
        return keyPath.split('.').reduce((acc, part) => {
            return acc && acc[part] !== undefined ? acc[part] : null;
        }, obj);
    }

    /**
     * Обходит весь DOM-дерево текущей страницы и переводит размеченные элементы
     */
    function translatePage() {
        // 1. Перевод стандартного текстового содержимого (атрибут data-i18n)
        const textElements = document.querySelectorAll("[data-i18n]");
        textElements.forEach(element => {
            const key = element.getAttribute("data-i18n");
            const value = getNestedValue(translations, key);
            if (value !== null) {
                // Используем innerHTML, чтобы в переводах можно было использовать теги форматирования (например, <br>, <strong>)
                element.innerHTML = value;
            }
        });

        // 2. Перевод плейсхолдеров в полях ввода (атрибут data-i18n-placeholder)
        const placeholderElements = document.querySelectorAll("[data-i18n-placeholder]");
        placeholderElements.forEach(element => {
            const key = element.getAttribute("data-i18n-placeholder");
            const value = getNestedValue(translations, key);
            if (value !== null) {
                element.setAttribute("placeholder", value);
            }
        });

        // 3. Перевод всплывающих подсказок (атрибут data-i18n-title)
        const titleElements = document.querySelectorAll("[data-i18n-title]");
        titleElements.forEach(element => {
            const key = element.getAttribute("data-i18n-title");
            const value = getNestedValue(translations, key);
            if (value !== null) {
                element.setAttribute("title", value);
            }
        });

        // 4. Перевод альтернативного текста для изображений (атрибут data-i18n-alt)
        const altElements = document.querySelectorAll("[data-i18n-alt]");
        altElements.forEach(element => {
            const key = element.getAttribute("data-i18n-alt");
            const value = getNestedValue(translations, key);
            if (value !== null) {
                element.setAttribute("alt", value);
            }
        });

        // 5. Визуально обновляем кнопки переключения языков на сайте
        updateLanguageSwitcherUI();
    }

    /**
     * Находит на странице кнопки переключения языков и вешает на активную класс .active
     */
    function updateLanguageSwitcherUI() {
        const langButtons = document.querySelectorAll("[data-lang]");
        langButtons.forEach(button => {
            if (button.getAttribute("data-lang") === currentLang) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    }

    /**
     * Переключает язык приложения, сохраняет выбор и обновляет интерфейс
     */
    async function switchLanguage(lang) {
        if (lang !== "ru" && lang !== "en") return;
        
        currentLang = lang;
        localStorage.setItem("lang", lang);
        
        await loadTranslations(currentLang);
        translatePage();

        // Создаем и генерируем глобальное событие. 
        // Оно нужно для того, чтобы другие ваши JS-скрипты (например, корзина или каталог товаров) 
        // узнали, что язык сменился, и заново перерисовали динамические элементы.
        const event = new CustomEvent("languageChanged", {
            detail: { language: currentLang }
        });
        document.dispatchEvent(event);
    }

    // --- ГЛОБАЛЬНЫЕ ФУНКЦИИ (Будут доступны во всех остальных ваших JS-файлах) ---

    /**
     * Позволяет переводить динамические строки прямо внутри JS-кода.
     * Пример использования в других файлах: const text = window.translate("buttons.add_to_cart");
     */
    window.translate = function(key) {
        const value = getNestedValue(translations, key);
        return value !== null ? value : key;
    };

    /**
     * Позволяет быстро узнать текущий выбранный язык в любом другом скрипте.
     * Пример использования: if (window.getCurrentLanguage() === "en") { ... }
     */
    window.getCurrentLanguage = function() {
        return currentLang;
    };

    // --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ ---
    async function init() {
        // Загружаем язык
        await loadTranslations(currentLang);
        
        // Переводим статическую верстку
        translatePage();

        // Делегирование событий: отслеживаем клики по кнопкам с атрибутом data-lang
        document.addEventListener("click", (e) => {
            const langBtn = e.target.closest("[data-lang]");
            if (langBtn) {
                e.preventDefault();
                const targetLang = langBtn.getAttribute("data-lang");
                if (targetLang && targetLang !== currentLang) {
                    switchLanguage(targetLang);
                }
            }
        });
    }

    // Запуск системы локализации
    init();
});