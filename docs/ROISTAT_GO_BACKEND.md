# Roistat: что нужно добавить на Go-бэкенде

Во фронте Nuxt теперь во все основные заявки/заказы передаётся поле:

```json
{
  "roistat": "значение_cookie_roistat_visit_или_nocookie"
}
```

Чтобы связка заработала до CRM, Go-бэкенд должен принять это поле в DTO создания заказа/лида/предзаказа и передать его дальше в CRM в техническое поле `roistat`.

## Пример DTO

```go
type CreateOrderRequest struct {
    // существующие поля заказа...
    Roistat string `json:"roistat"`
}
```

## Нормализация перед отправкой в CRM

```go
roistatVisitID := strings.TrimSpace(req.Roistat)
if roistatVisitID == "" {
    roistatVisitID = "nocookie"
}
```

## Пример передачи в CRM

```go
crmPayload := map[string]any{
    // существующие поля...
    "roistat": roistatVisitID,
}
```

Важно: если на Go используется строгий JSON-декодер с `DisallowUnknownFields`, backend нужно обновить до деплоя фронта, иначе он может отклонить новые запросы с полем `roistat`.
