# Хранение файлов задач в приватном S3 (FirstVDS)

Дата: 2026-10-27. Модули: `tasks-service`, `web-ui`, `nginx`, `docker-compose.yml`, `.github/workflows/create_env.yml`, `AGENTS.md`.

## Overview

Прикрепление файлов к задаче (`Task`): содержимое — в приватном S3-совместимом bucket FirstVDS, метаданные — в PostgreSQL tasks-service. Файлы привязаны и к таску, и к пользователю (`sub` из Keycloak): список, скачивание, удаление доступны только владельцу.

Проблема: `Task.files` — `@ElementCollection` с `@Embeddable File` (только `title`/`filename`); контента за записями нет; S3-интеграции и AWS SDK нет.

### Принятые решения (дерево дизайна, интервью 2026-10-27)

| # | Ветка | Решение |
|---|-------|---------|
| 1 | Бэкенд хранилища | S3-совместимый bucket FirstVDS, custom endpoint (AWS SDK v2) |
| 2 | Модель | `@Entity TaskFile` вместо `@Embeddable File`; таблица `files` пересоздаётся без переноса; `title` не храним |
| 3 | Трафик | Upload: multipart через tasks-service (PutObject из сервиса). Download: presigned GET напрямую в FirstVDS |
| 4 | Протокол | Без статусов PENDING/READY: строка БД после успешной записи объекта; компенсация при падении save |
| 5 | Ключи | `users/{sub}/tasks/{taskId}/{uuid}`; имя файла только в `Content-Disposition` |
| 6 | Лимиты | 10 МБ/файл, типы не ограничиваем |
| 7 | API | Чтение — Data REST (HAL); операции — `FileController` |
| 8 | Удаление | Delete-методы Task/Repository с bulk-JPQL на entity-удаление; `@PostRemove` → `AFTER_COMMIT` чистка S3, best-effort |
| 9 | Клиент | AWS SDK v2 (BOM + `s3`), бины `S3Client`/`S3Presigner`, `endpointOverride`, path-style |
| 10 | Конфиг | 6 env `S3_*` + дефолты в yaml; compose, `create_env.yml`, GitHub secrets, AGENTS.md |
| 11 | web-ui | Минимальный: загрузка в форме задачи, список/скачать/удалить в карточке |
| 12 | Тесты | Юниты с мок-`FileStorageService` + ручной e2e-чеклист |
| 13 | Data REST | `taskFiles` read-only (`RepositoryConfigurationExtension`, только GET) |
| 14 | Bucket | Приватный, без versioning, без CORS |
| 15 | Presigned GET | TTL 120 с, attachment c `filename*=UTF-8''` (RFC 5987) |
| 16 | JPA | Bidirectional, LAZY, `Set<TaskFile>` LinkedHashSet, `cascade=ALL, orphanRemoval=true`, proxy-safe equals/hashCode по id |

### Ключевые потоки

```text
UPLOAD   Angular FormData -> POST /api/v1/files?taskId= (gateway /api/** TokenRelay+CSRF)
         -> tasks-service: валидация ≤10МБ; task = TaskRepository.findById (фильтр sub, чужой -> 404)
         -> key=users/{sub}/tasks/{taskId}/{uuid}; S3 putObject; save TaskFile
         (падение save после putObject -> компенсационный deleteObject + 500; S3-ошибка -> 502)

DOWNLOAD Angular -> GET /api/v1/files/{id}/download-url (фильтр по sub)
         -> presigned GET TTL 120с, content-disposition attachment(RFC5987) -> {url,...}
         -> window.open(url): байты идут браузер <-> FirstVDS, сервис не участвует

DELETE   DELETE /api/v1/files/{id} | JPA-каскад Task/Workspace
         -> удаление строк через JPA (не bulk!) -> @PostRemove FileRemovedEvent(keys)
         -> @TransactionalEventListener(AFTER_COMMIT): storage.delete, ошибка -> WARN-лог
```

## Context (из исследования кода)

- `Task.java:42-50` — `@ElementCollection List<File>` (EAGER, bag без id); `File.java` — `@Embeddable title/filename`.
- `TaskRepository.java` / `WorkspaceRepository.java` — delete-методы bulk-JPQL: JPA-каскад/слушатели не срабатывают (каскадит только FK `onDelete CASCADE`) — переписать на entity-удаление.
- `PersistenceConfig.java` — `@EnableJpaAuditing` + `SecurityEvaluationContextExtension`; `SecurityAuditorAware.java` — `@CreatedBy` = JWT `sub`.
- `db.changelog` — `001-initial-schema.yml` с таблицей `files(task_id,title,filename)`.
- `gateway-reactive` — маршрут `/api/**` + `TokenRelay` подходит, изменений нет (стриминг 10 МБ проверить e2e).
- `nginx/dipdeepcode.ru/dipdeepcode.ru.conf` — regex-location `/api` — нужен `client_max_body_size`.
- `web-ui` — HAL-сервисы (`base-resource.service.ts`, `hal.interceptor.ts`), `declarations.ts` без файлов, тест-таргета нет.
- Spring Boot 4.1.0 / Java 17; AWS SDK version не управляется parent — нужен BOM.

## Development Approach

- Testing: Regular (код → юниты на каждый таск); S3 целиком за интерфейсом `FileStorageService`, в тестах мок.
- Тесты зелёные перед следующим таском; `.\mvnw.cmd test` из `tasks-service/`; smoke-тесты контекста не должны сломаться (дефолты `S3_*` в yaml).
- > **Требуется скилл spring-data-jpa** для тасков 2-3: bidirectional LAZY, `Set` + proxy-safe equals/hashCode, явные `@Column(name=...)`, relation-поля вне equals/toString.

## Technical Details

### pom.xml

`software.amazon.awssdk:bom` (актуальную 2.x зафиксировать на старте) в `dependencyManagement` + артефакт `s3`.

### application.yaml

```yaml
spring.servlet.multipart: { max-file-size: 10MB, max-request-size: 12MB }
s3:
  endpoint: ${S3_ENDPOINT:http://localhost:9000}
  region: ${S3_REGION:ru-1}
  bucket: ${S3_BUCKET:wts-files}
  access-key: ${S3_ACCESS_KEY:minioadmin}
  secret-key: ${S3_SECRET_KEY:minioadmin}
  path-style-access: ${S3_PATH_STYLE:true}
  download-url-ttl-seconds: ${S3_DOWNLOAD_URL_TTL:120}
```

`S3Properties` (`@ConfigurationProperties("s3")`) + `S3Config`: `S3Client`, `S3Presigner` (`endpointOverride`, `Region.of`, `StaticCredentialsProvider`, path-style). Реальные endpoint/region/path-style — из панели FirstVDS (probe-чек в Post-Completion).

### Схема БД (`002-files-as-entities.yml`)

dropTable старой `files` → createTable `files`: `id BIGSERIAL PK`, `task_id BIGINT NOT NULL`, `filename VARCHAR(255) NOT NULL`, `content_type VARCHAR(255)`, `size_bytes BIGINT NOT NULL`, `storage_key VARCHAR(512) NOT NULL UNIQUE`, `created_by VARCHAR(255)`, `created_date TIMESTAMP NOT NULL`; FK `fk_file_task`→`tasks(id)` CASCADE; индекс `idx_file_created_by`.

### Сущности

`TaskFile`: `@Entity @Table(name="files")`, явные `@Column(name=...)`, `@ManyToOne(fetch=LAZY) @JoinColumn(name="task_id", foreignKey=@ForeignKey(name="fk_file_task"))`, `@CreatedBy`, `@CreatedDate`, `@EntityListeners({AuditingEntityListener, TaskFileEntityListener})`, proxy-safe equals/hashCode.
`Task`: `@OneToMany(mappedBy="task", fetch=LAZY, cascade=ALL, orphanRemoval=true) Set<TaskFile> files = new LinkedHashSet<>()` + `addFile/removeFile`; удалить `File.java`.

### Репозиторий / Data REST

`TaskFileRepository extends CrudRepository<TaskFile, Long>` — override `findById/existsById/findAll/count/deleteById/delete/…` c `f.createdBy = ?#{principal?.claims['sub']}` (образец `TaskRepository`). `TaskFileRestConfig` (`RepositoryConfigurationExtension`): GET-only для `taskFiles`. Пути `FileController` (`/api/v1/files/**`) с Data REST не конфликтуют.

### Сервисы / контроллер

`FileStorageService`: `put(key, InputStream, size, contentType)`, `delete(key)`, `presignGet(key, downloadName, ttl): URI`; реализация `S3FileStorageService`.

`FileController` (`/api/v1/files`; авторизация обязательна — permit-all только `/healthcheck`):
- `POST ""` (`file` + `taskId`): `isEmpty`/≤10МБ; `taskRepository.findById` (404 для чужого); put→save; S3-ошибка→502; падение save→компенсация+500; ответ 201+метаданные.
- `GET /{id}/download-url`: presign (TTL 120 с, attachment RFC 5987) → `{url, filename, expiresInSeconds}`.
- `DELETE /{id}`: findById+entity-delete; S3 — через слушатель.
- Чужой файл → 404 (не 403).

`TaskFileEntityListener.@PostRemove` → `FileRemovedEvent(keys)` (бин через SpringBeanContainer Boot); `FileCleanupListener` `@TransactionalEventListener(AFTER_COMMIT)` — try/catch, WARN. Покрывает и каскад Task/Workspace.

### Удаление тасков/воркспейсов

`TaskRepository`/`WorkspaceRepository`: delete-методы → entity-удаление (загрузка через фильтрованные `findById/findAllById` → `delete(entity)`/`deleteAll(entities)` в одной транзакции; `deleteAll()` → `deleteAll(findAll())`). Фильтр «только свои» сохраняется через find.

### nginx / compose / CI / AGENTS.md

- `dipdeepcode.ru.conf`: `client_max_body_size 12m;` в location `/api` (`nginx -t`+reload уже в `copy-nginx-conf.yml`).
- `docker-compose.yml` `tasks-service.environment`: `S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_PATH_STYLE` (`${VAR}`).
- `create_env.yml`: vars `S3_ENDPOINT/S3_BUCKET/S3_REGION/S3_PATH_STYLE`, secrets `S3_ACCESS_KEY/S3_SECRET_KEY` → удалённый `.env`.
- `AGENTS.md`: 6 переменных в обязательный список + примечание (download идёт напрямую в FirstVDS, минуя gateway/nginx).

### web-ui

- `declarations.ts`: `interface TaskFile { filename; contentType?; sizeBytes; createdDate }`.
- `files.service.ts`: `upload(taskId,file)` FormData `POST /api/v1/files?taskId=`; `listByTask` — relation `_links.files.href`; `download(id)` → `window.open`; `remove(id)` → DELETE. XSRF-cookie от Angular на multipart POST проверить живым запросом.
- `task-form.component.ts`: `<input type="file" multiple>`; после сохранения задачи — последовательная загрузка; ошибка файла = toast, без отката задачи.
- `task.component.ts`+html: список (имя, размер, дата) + «Скачать»/«Удалить».

## Testing Strategy

Юниты (мок `FileStorageService`): upload (успех; >10МБ→400; чужая задача→404; компенсация deleteObject при падении save); download-url (только свой; чужой→404; TTL+disposition в presign-запросе); delete (storage.delete только после commit); каскад Task→файлы (все ключи в `FileRemovedEvent`, bulk больше не используется); `S3Config` с дефолтами; smoke-контексты зелёные без S3. E2e — ручной чек-лист.

## Progress Tracking

`[x]` выполнено, `[+]` найдено по ходу, `[!]` блокер; файл плана обновлять при смене скоупа.

## Implementation Steps

### Task 1: Liquibase-миграция файлов

**Files:**
- Create: `tasks-service/src/main/resources/db/changelog/changes/002-files-as-entities.yml`
- Modify: `tasks-service/src/main/resources/db/changelog/db.changelog-master.yml`

- [ ] changeset drop старой таблицы `files`
- [ ] changeset create новой `files` (колонки, PK, FK cascade, unique `storage_key`, индекс `created_by`)
- [ ] include `002` в master-changelog
- [ ] прогнать `.\mvnw.cmd test` (Liquibase-run + `ddl-auto: validate` не падают) — green перед Task 2

### Task 2: Сущность TaskFile вместо Embeddable File

**Files:**
- Delete: `tasks-service/src/main/java/ru/ddc/tasksservice/domain/entity/File.java`
- Create: `.../domain/entity/TaskFile.java`
- Modify: `.../domain/entity/Task.java`

- [ ] создать `TaskFile` (см. Technical Details; явные `@Column`, LAZY, auditing)
- [ ] в `Task` заменить коллекцию на `Set<TaskFile>` bidirectional LAZY + `addFile/removeFile`
- [ ] удалить `File.java`, починить импорты (включая `getImages()`-геттер коллекции)
- [ ] write tests: helpers синхронизируют обе стороны; equals/hashCode proxy-safe
- [ ] run tests — green

### Task 3: TaskFileRepository + read-only Data REST + entity-удаление Task/Workspace

**Files:**
- Create: `.../domain/repository/TaskFileRepository.java`
- Create: `.../configuration/TaskFileRestConfig.java`
- Modify: `.../domain/repository/TaskRepository.java`, `.../domain/repository/WorkspaceRepository.java`

- [ ] репозиторий с JPQL-фильтрами по `principal.claims['sub']` (паттерн TaskRepository)
- [ ] `RepositoryConfigurationExtension`: GET-only для `taskFiles`
- [ ] переписать delete-методы Task/Workspace на entity-удаление с сохранением owner-guard
- [ ] write tests: чужой TaskFile→пустой Optional; чужое удаление Task→0 затронутых; каскад Task→файлы удаляет строки
- [ ] run tests — green

### Task 4: AWS SDK + FileStorageService + конфигурация

**Files:**
- Modify: `tasks-service/pom.xml`
- Create: `.../configuration/S3Properties.java`, `.../configuration/S3Config.java`
- Create: `.../storage/FileStorageService.java`, `.../storage/S3FileStorageService.java`
- Modify: `tasks-service/src/main/resources/application.yaml`

- [ ] BOM + `s3` зависимость (зафиксировать версия)
- [ ] `S3Properties` + `application.yaml` (s3.*, multipart 10/12 МБ, env-дефолты)
- [ ] бины `S3Client`/`S3Presigner` (endpointOverride, region, static creds, path-style)
- [ ] `FileStorageService`/`S3FileStorageService` (put/delete/presignGet)
- [ ] write tests: бин конструируется с дефолтными env; put передаёт contentType/size; presignGet ставит disposition+TTL
- [ ] run tests — green

### Task 5: FileController — upload / download-url / delete + S3-cleanup слушатели

**Files:**
- Create: `.../controller/FileController.java`, `.../controller/FileService.java` (или `.../service/`)
- Create: `.../domain/event_handlers/TaskFileEntityListener.java`, `.../domain/event_handlers/FileCleanupListener.java`
- Modify: `.../domain/entity/TaskFile.java` (подключить `@EntityListeners`)

- [ ] POST multipart: валидации (пустой, >10МБ, чужой/нет task→404), key `users/{sub}/tasks/{taskId}/{uuid}`, put→save, компенсация
- [ ] GET download-url (TTL+disposition RFC 5987); DELETE /{id} entity-delete
- [ ] `@PostRemove`→событие; `AFTER_COMMIT` слушатель чистит S3 best-effort (log WARN)
- [ ] write tests: все сценарии Testing Strategy для контроллера/слушателей (мок `FileStorageService` + mockMvc/webmvc-test)
- [ ] run tests — green

### Task 6: nginx и gateway-проверки конфигурации

**Files:**
- Modify: `nginx/dipdeepcode.ru/dipdeepcode.ru.conf`

- [ ] `client_max_body_size 12m;` в location, проксирующем `/api` на gateway
- [ ] убедиться, что других изменений nginx/gateway не требуется (маршрут `/api/**` уже есть)
- [ ] конфиг коммитится; `nginx -t` выполнится при деплое `copy-nginx-conf.yml`

### Task 7: web-ui — сервис файлов и минимальный UI

**Files:**
- Modify: `web-ui/src/app/core/declarations.ts`
- Create: `web-ui/src/app/core/services/files.service.ts`
- Modify: `web-ui/src/app/tasks/task-form/task-form.component.ts`, `web-ui/src/app/tasks/task/task.component.ts` (+ html/css)

- [ ] интерфейс `TaskFile` + сервис upload/list/download/delete поверх HAL-href
- [ ] input file multiple в форме задачи; загрузка после сохранения задачи; toast-ошибки
- [ ] список файлов + кнопки «Скачать» (`window.open` download-url) / «Удалить» в карточке
- [ ] `npm run build` — green (тест-таргета в web-ui нет)

### Task 8: Инфраструктура и документация

**Files:**
- Modify: `docker-compose.yml`, `.github/workflows/create_env.yml`, `AGENTS.md`

- [ ] `S3_*` env в `tasks-service.environment` compose
- [ ] `create_env.yml`: vars `S3_ENDPOINT/S3_BUCKET/S3_REGION/S3_PATH_STYLE`, secrets `S3_ACCESS_KEY/S3_SECRET_KEY`
- [ ] AGENTS.md: обязательный список env + примечание о прямом download-путь браузер→FirstVDS
- [ ] прогнать `.\mvnw.cmd test` всего backend, `npm run build` frontend

### Task 9: Финальная верификация

- [ ] полный `.\mvnw.cmd test` (tasks-service) — green
- [ ] `.\mvnw.cmd -DskipTests package` (tasks-service) — сборка ок
- [ ] `npm ci && npm run build` (web-ui) — сборка ок
- [ ] план переведён в `docs/plans/completed/`

## Post-Completion

**Провайдер (FirstVDS, вручную/CLI):**
- создать приватный bucket (versioning OFF, CORS не настраивать); взять endpoint/region, access/secret; проверить поддержка path-style vs virtual-host (в константе пробы: `aws s3 --endpoint-url ... cp/ls/presign` или s5cmd).
- GitHub environment: добавить secrets `S3_ACCESS_KEY/S3_SECRET_KEY` и vars `S3_*` (без них `create_env.yml` сгенерит пустые значения).

**Деплой:** штатные workflows — `deploy-tasks-service.yml` (+ regenerate env), `copy-nginx-conf.yml`, деплой web-ui.

**Ручной e2e-чеклист (на dev-стенде):**
1. загрузка 3 МБ файла на свою задачу → файл в списке и в bucket (префикс `users/{sub}/...`);
2. загрузка >10 МБ → 400 до записи в S3;
3. download → файл скачивается с исходным именем (кириллица OK), ссылка не работает через 2+ мин;
4. чужой файл: `download-url` и `DELETE` → 404 (под вторым пользователем Keycloak);
5. удаление файла → нет строки в БД и нет объекта в bucket;
6. удаление задачи → все её файлы удалены из bucket (лог слушателя);
7. удаление воркспейса → аналогично (каскад);
8. PUT-подобные методы на `/api/v1/taskFiles/{id}` → 405/403 (read-only);
9. запись/чтение через gateway (не только напрямую на 8080) — multipart проходит `TokenRelay`, CSRF не блокирует.

**Риски:**
- лимит одного PUT у FirstVDS (обычно 5 ГБ) — наш 10 МБ заведомо ок; multipart-upload не используем;
- если endpoint FirstVDS не резолвится/блокируется из браузера пользователей — presigned-скачка деградирует; варианты: fallback-эндпоинт в `S3_ENDPOINT` или переезд на proxy-download через сервис (решение 3 можно частично откатить);
- утекшая presigned-ссылка живёт 120 с — принято осознанно;
- orphan-объекты при падении процесса между putObject и save (окно в миллисекунды) — не чиним специально, компенсирующий delete покрывает основную ветку; при накоплении — разовая сверка list-prefix против БД.