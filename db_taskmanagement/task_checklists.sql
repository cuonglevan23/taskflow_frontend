create table if not exists task_checklists
(
    id           bigint auto_increment
        primary key,
    created_at   datetime(6)  null,
    is_completed bit          null,
    item         varchar(255) not null,
    task_id      bigint       not null,
    constraint fk_checklist_task
        foreign key (task_id) references tasks (id)
);

