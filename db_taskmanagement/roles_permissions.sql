create table if not exists roles_permissions
(
    role_id       bigint not null,
    permission_id bigint not null,
    constraint `PRIMARY`
        primary key (role_id, permission_id),
    constraint FKbx9r9uw77p58gsq4mus0mec0o
        foreign key (permission_id) references permissions (id),
    constraint FKqi9odri6c1o81vjox54eedwyh
        foreign key (role_id) references roles (id)
);

