package ru.ddc.tasksservice.domain.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks",
        indexes = {
                @Index(name = "idx_task_created_by", columnList = "createdBy")
        })
@EntityListeners(AuditingEntityListener.class)
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String summary;

    private LocalDate dueDate;

    private Integer orderBy;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @ManyToOne
    @JoinColumn(
            name = "workspace_id",
            foreignKey = @ForeignKey(name = "fk_task_workspace")
    )
    private Workspace workspace;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "files",
            joinColumns = @JoinColumn(
                    name = "task_id",
                    foreignKey =  @ForeignKey(name = "fk_files_task")
            )
    )
    private List<File> files = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public void setWorkspace(Workspace workspace) {
        this.workspace = workspace;
    }

    public List<File> getImages() {
        return files;
    }

    public void setImages(List<File> files) {
        this.files = files;
    }

    public Integer getOrderBy() {
        return orderBy;
    }

    public void setOrderBy(Integer orderBy) {
        this.orderBy = orderBy;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
