create table if not exists post_likes
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6) not null,
    post_id    bigint      not null,
    user_id    bigint      not null,
    constraint UK5l2rj28vw5oj6f7ox746grokg
        unique (post_id, user_id),
    constraint FKa5wxsgl4doibhbed9gm7ikie2
        foreign key (post_id) references posts (id),
    constraint FKkgau5n0nlewg6o9lr4yibqgxj
        foreign key (user_id) references users (id)
)
    auto_increment = 103;

