create table if not exists project_task_assignees
(
    task_id bigint not null,
    user_id bigint not null,
    constraint FK5aw40f6jgfnu6uqdp2ao2wq2x
        foreign key (user_id) references users (id),
    constraint FKneq70pu14jr61leaxhbuu5qkn
        foreign key (task_id) references project_tasks (id)
);

