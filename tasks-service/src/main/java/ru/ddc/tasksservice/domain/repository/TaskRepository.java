package ru.ddc.tasksservice.domain.repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;
import ru.ddc.tasksservice.domain.entity.Task;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends CrudRepository<Task, Long> {

    @Override
    @Query("select t from Task t where t.id = :id and t.createdBy = ?#{principal?.claims['sub']}")
    Optional<Task> findById(@Param("id") Long id);

    @Override
    @Query("select count(t) > 0 from Task t where t.id = :id and t.createdBy = ?#{principal?.claims['sub']}")
    boolean existsById(@Param("id") Long id);

    @Override
    @Query("select t from Task t where t.createdBy = ?#{principal?.claims['sub']}")
    List<Task> findAll();

    @Override
    @Query("select t from Task t where t.id in :ids and t.createdBy = ?#{principal?.claims['sub']}")
    List<Task> findAllById(@Param("ids") Iterable<Long> ids);

    @Override
    @Query("select count(t) from Task t where t.createdBy = ?#{principal?.claims['sub']}")
    long count();

    @Override
    @Modifying
    @Transactional
    @Query("delete from Task t where t.id = :id and t.createdBy = ?#{principal?.claims['sub']}")
    void deleteById(@Param("id") Long id);

    @Override
    @Modifying
    @Transactional
    @Query("delete from Task t where t.id = :#{#entity.id} and t.createdBy = ?#{principal?.claims['sub']}")
    void delete(@Param("entity") Task entity);

    @Override
    @Modifying
    @Transactional
    @Query("delete from Task t where t.id in :ids and t.createdBy = ?#{principal?.claims['sub']}")
    void deleteAllById(@Param("ids") Iterable<? extends Long> ids);

    @Override
    @Modifying
    @Transactional
    @Query("delete from Task t where t.id in :#{#entities.![id]} and t.createdBy = ?#{principal?.claims['sub']}")
    @RestResource(exported = false)
    void deleteAll(@Param("entities") Iterable<? extends Task> entities);

    @Override
    @Modifying
    @Transactional
    @Query("delete from Task t where t.createdBy = ?#{principal?.claims['sub']}")
    @RestResource(exported = false)
    void deleteAll();
}
