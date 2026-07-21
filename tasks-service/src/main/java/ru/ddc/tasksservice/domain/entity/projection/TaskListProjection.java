package ru.ddc.tasksservice.domain.entity.projection;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.rest.core.config.Projection;
import ru.ddc.tasksservice.domain.entity.Task;

import java.time.LocalDate;

@Projection(name = "list", types = {Task.class})
public interface TaskListProjection {

    String getTitle();

    String getSummary();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    LocalDate getDueDate();

    Integer getOrderBy();
}
