create table if not exists team_task_assignees
(
    task_id bigint not null,
    user_id bigint not null,
    constraint FKhk2jqmgopbva81u0ex5ja9ytl
        foreign key (user_id) references users (id),
    constraint FKx5gxkc3l4yaax34gvc8sypdm
        foreign key (task_id) references team_tasks (id)
);

