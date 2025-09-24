create table if not exists notes
(
    id          bigint auto_increment
        primary key,
    content     json          null,
    created_at  datetime(6)   not null,
    description varchar(1000) null,
    is_archived bit           not null,
    is_public   bit           not null,
    title       varchar(255)  not null,
    updated_at  datetime(6)   not null,
    creator_id  bigint        not null,
    project_id  bigint        null,
    user_id     bigint        null,
    constraint FK36j06rxyunv0c9is8wpk050bv
        foreign key (creator_id) references users (id),
    constraint FKechaouoa6kus6k1dpix1u91c
        foreign key (user_id) references users (id),
    constraint FKf5kwkuxo55mgr2vkluhrh7tth
        foreign key (project_id) references projects (id)
)
    auto_increment = 10;

