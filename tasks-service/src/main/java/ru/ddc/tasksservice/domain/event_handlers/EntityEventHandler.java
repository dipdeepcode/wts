package ru.ddc.tasksservice.domain.event_handlers;

import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import ru.ddc.tasksservice.domain.entity.Task;
import ru.ddc.tasksservice.domain.entity.Workspace;

@Component
@RepositoryEventHandler
public class EntityEventHandler {


    @HandleBeforeCreate
    public void handleWorkspaceCreate(Workspace workspace) {
        // Логика перед созданием Workspace
    }

    @HandleBeforeSave
    public void handleWorkspaceSave(Workspace workspace) {
        validateOwnership(workspace.getCreatedBy());
    }


    @HandleBeforeCreate
    public void handleTaskCreate(Task task) {
        // Логика перед созданием Task
    }

    @HandleBeforeSave
    public void handleTaskSave(Task task) {
        // Проверяем владельца задачи
        validateOwnership(task.getCreatedBy());
    }

    private void validateOwnership(String creatorId) {
        String currentUserId = getCurrentUserId();
        if (creatorId != null && !creatorId.equals(currentUserId)) {
            throw new AccessDeniedException("Вы не можете редактировать чужую запись");
        }
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("sub");
        }
        throw new AccessDeniedException("Пользователь не авторизован");
    }
}

