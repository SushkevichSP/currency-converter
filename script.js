document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы формы
    const form = document.getElementById('converter-form');
    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const resultInput = document.getElementById('result');
    const rateInfo = document.getElementById('rate-info');
    const swapButton = document.getElementById('swap-button');
    const loader = document.getElementById('loader');
    const errorDisplay = document.getElementById('error-message'); 

    // Основные валюты для конвертера
    const currencies = [
        { code: 'USD', name: 'Доллар США' },
        { code: 'EUR', name: 'Евро' },
        { code: 'RUB', name: 'Российский рубль' },
        { code: 'GBP', name: 'Британский фунт' },
        { code: 'JPY', name: 'Японская иена' },
        { code: 'CNY', name: 'Китайский юань' },
        { code: 'CHF', name: 'Швейцарский франк' },
        { code: 'KZT', name: 'Казахстанский тенге' },
        { code: 'TRY', name: 'Турецкая лира' },
        { code: 'UAH', name: 'Украинская гривна' }
    ];

    // Инициализация селекторов валют
    function initializeCurrencySelectors() {
        currencies.forEach(currency => {
            const optionFrom = new Option(`${currency.code} - ${currency.name}`, currency.code);
            const optionTo = new Option(`${currency.code} - ${currency.name}`, currency.code);
            
            fromCurrency.add(optionFrom);
            toCurrency.add(optionTo);
        });

        // Устанавливаем значения по умолчанию
        fromCurrency.value = 'USD';
        toCurrency.value = 'RUB';
        hideLoader();
    }

    // Получение курса валют через API
    async function getExchangeRate(from, to) {
        try {
            showLoader();
            const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
            const data = await response.json();

            if (data.rates && data.rates[to]) {
                return {
                    rate: data.rates[to],
                    timestamp: data.time_last_update_utc // Получаем время обновления
                };
            } else {
                throw new Error('Не удалось получить курс валют');
            }
        } catch (error) {
            console.error('Ошибка при получении курса валют:', error);
            alert('Не удалось получить курс валют. Пожалуйста, попробуйте позже.');
            return null;
        } finally {
            hideLoader();
        }
    }

    // Форматирование даты
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        return date.toLocaleString('ru-RU', options).replace(',', '');
    }

    // Конвертация валют
    async function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        const from = fromCurrency.value;
        const to = toCurrency.value;

        if (!amount || !from || !to) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        const exchangeData = await getExchangeRate(from, to);
        
        if (exchangeData) {
            const result = amount * exchangeData.rate;
            resultInput.value = result.toFixed(2);
            
            // Показываем информацию о курсе с отформатированной датой
            rateInfo.textContent = `1 ${from} = ${exchangeData.rate.toFixed(4)} ${to} (обновлено: ${exchangeData.timestamp})`;
            rateInfo.style.display = 'block';
        }
    }

    // Обмен валют местами
    function swapCurrencies() {
        const tempCurrency = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = tempCurrency;

        if (amountInput.value) {
            convertCurrency();
        }
    }

    // Управление индикатором загрузки
    function showLoader() {
        loader.style.display = 'flex';
        form.style.opacity = '0.5';
    }

    function hideLoader() {
        loader.style.display = 'none';
        form.style.opacity = '1';
    }

    // Обработчики событий
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        convertCurrency();
    });

    swapButton.addEventListener('click', swapCurrencies);

    // Автоматическая конвертация при изменении селекторов
    fromCurrency.addEventListener('change', () => {
        if (amountInput.value) convertCurrency();
    });

    toCurrency.addEventListener('change', () => {
        if (amountInput.value) convertCurrency();
    });

    // Инициализация приложения
    initializeCurrencySelectors();
});