package ru.ddc.tasksservice.domain.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.transaction.annotation.Transactional;
import ru.ddc.tasksservice.domain.entity.Workspace;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends CrudRepository<Workspace, Long> {

    @Override
    @Query("select w from Workspace w " +
            "left join fetch w.tasks t " +
            "where w.id = :id " +
            "and w.createdBy = ?#{principal?.claims['sub']} " +
            "and (t is null or t.createdBy = ?#{principal?.claims['sub']})")
    Optional<Workspace> findById(@Param("id") Long id);

    @Override
    @Query("select count(w) > 0 from Workspace w where w.id = :id and w.createdBy = ?#{principal?.claims['sub']}")
    boolean existsById(@Param("id") Long id);

    @Override
    @Query("select w from Workspace w where w.createdBy = ?#{principal?.claims['sub']}")
    List<Workspace> findAll();

    @Override
    @Query("select w from Workspace w where w.id in :ids and w.createdBy = ?#{principal?.claims['sub']}")
    List<Workspace> findAllById(@Param("ids") Iterable<Long> ids);

    @Override
    @Query("select count(w) from Workspace w where w.createdBy = ?#{principal?.claims['sub']}")
    long count();

    @Override
    @Modifying
    @Transactional
    @Query("delete from Workspace w where w.id = :id and w.createdBy = ?#{principal?.claims['sub']}")
    void deleteById(@Param("id") Long id);

    @Override
    @Modifying
    @Transactional
    @Query("delete from Workspace w where w.id = :#{#entity.id} and w.createdBy = ?#{principal?.claims['sub']}")
    void delete(@Param("entity") Workspace entity);

    @Override
    @Modifying
    @Transactional
    @Query("delete from Workspace w where w.id in :ids and w.createdBy = ?#{principal?.claims['sub']}")
    void deleteAllById(@Param("ids") Iterable<? extends Long> ids);

    @Override
    @Modifying
    @Transactional
    @Query("delete from Workspace w where w.id in :#{#entities.![id]} and w.createdBy = ?#{principal?.claims['sub']}")
    @RestResource(exported = false) // Скрываем из внешнего REST API
    void deleteAll(@Param("entities") Iterable<? extends Workspace> entities);

    @Override
    @Modifying
    @Transactional
    @Query("delete from Workspace w where w.createdBy = ?#{principal?.claims['sub']}")
    @RestResource(exported = false) // Скрываем из внешнего REST API
    void deleteAll();
}
