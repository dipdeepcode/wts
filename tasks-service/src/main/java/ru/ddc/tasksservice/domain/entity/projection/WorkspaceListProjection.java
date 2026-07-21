package ru.ddc.tasksservice.domain.entity.projection;

import org.springframework.data.rest.core.config.Projection;
import ru.ddc.tasksservice.domain.entity.Workspace;

@Projection(name = "list", types = {Workspace.class})
public interface WorkspaceListProjection {
    String getName();
    String getOrderBy();
}
