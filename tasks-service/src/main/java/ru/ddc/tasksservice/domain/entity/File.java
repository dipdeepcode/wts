package ru.ddc.tasksservice.domain.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class File {

    protected String title;
    protected String filename;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

}
