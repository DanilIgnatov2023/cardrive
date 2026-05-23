# CarDrive — выполненные доработки

## Что добавлено

### Backend
- Бюджет по категориям: `CategoryBudget`, репозиторий, сервис, DTO и REST API.
- Умные уведомления: `Notification`, `NotificationType`, репозиторий, сервис, REST API и ежедневный scheduler.
- Топливная аналитика: поля `fuelLiters` и `fuelPricePerLiter` в расходах, расчёт расхода топлива по месяцам и endpoint `/api/analytics/fuel-consumption`.
- Liquibase-миграции для новых таблиц и колонок.
- Включён `@EnableScheduling`.

### Frontend
- Полный редизайн интерфейса: новый layout, шапка, sidebar, footer, современная светлая тема, адаптивность.
- Обновлены страницы входа, регистрации, dashboard, автомобилей, расходов, аналитики, бюджета, напоминаний.
- Добавлена страница уведомлений и колокольчик со счётчиком непрочитанных.
- Добавлены бюджет по категориям, массовое сохранение лимитов и отображение прогресса.
- Добавлен график расхода топлива по месяцам.
- Добавлены reusable-компоненты: `LoadingSpinner`, `EmptyState`, `ConfirmDialog`, `ToastNotifications`, `NotificationBell`.

## Проверка

- Frontend: `npm run build` выполнен успешно.
- Backend: в текущей песочнице нет локального `mvn`, а `mvnw` не смог скачать Maven distribution из `repo.maven.apache.org`, поэтому backend-компиляцию здесь выполнить не удалось. Код и миграции подготовлены; локально с доступом в интернет выполните `./mvnw -DskipTests compile`.

## Запуск

### Backend
```bash
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend ожидает backend на `http://localhost:8080/api`, а CORS настроен под `http://localhost:3000`.
